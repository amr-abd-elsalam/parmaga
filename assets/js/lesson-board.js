/*
 * PARMAGA — Lesson board overlay — ADR-0021.
 *
 * Session-only strokes. No persistence, network, dependency, or build step.
 * Finger input is primary; pen and mouse are additional input paths.
 */
(function () {
  'use strict';

  var MAX_BACKING_PIXELS = 8294400;
  var MAX_STROKE_POINTS = 4096;
  var MAX_SESSION_POINTS = 60000;
  var MAX_STROKES = 500;

  var main = document.querySelector('main');
  var controlsList = document.querySelectorAll('.lesson-viewer-controls');

  if (!main || controlsList.length !== 1) {
    return;
  }

  var controls = document.querySelector('.lesson-viewer-controls');

  if (!controls || controls.parentNode !== main) {
    return;
  }

  if (
    !window.PointerEvent ||
    !window.HTMLDialogElement ||
    !HTMLDialogElement.prototype.showModal
  ) {
    return;
  }

  var root = null;
  var openButton = null;
  var dialog = null;
  var canvas = null;
  var context = null;
  var drawButton = null;
  var eraseButton = null;
  var undoButton = null;
  var redoButton = null;
  var clearButton = null;
  var closeButton = null;
  var status = null;

  var undoStack = [];
  var redoStack = [];
  var sessionPoints = 0;

  var activePointerId = null;
  var activeTouchId = null;
  var activePointerType = null;
  var penActive = false;
  var activePoints = [];
  var activeMode = 'draw';

  var pendingSamples = [];
  var frameRequest = 0;
  var resizeRequest = 0;
  var renderCursor = null;

  var logicalWidth = 0;
  var logicalHeight = 0;
  var modelWidth = 0;
  var modelHeight = 0;
  var viewScale = 1;
  var viewOffsetX = 0;
  var viewOffsetY = 0;
  var effectiveRatio = 1;

  var previousTime = 0;
  var previousX = 0;
  var previousY = 0;
  var smoothedPressure = 0.5;
  var smoothedSpeed = 0;
  var inkColor = '';

  function makeButton(label, className) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = label;
    return button;
  }

  function setStatus(message) {
    status.textContent = message;
  }

  function updateHistoryButtons() {
    undoButton.disabled = undoStack.length === 0;
    redoButton.disabled = redoStack.length === 0;
    clearButton.disabled = undoStack.length === 0;
  }

  function setMode(mode) {
    activeMode = mode;
    drawButton.setAttribute('aria-pressed', mode === 'draw' ? 'true' : 'false');
    eraseButton.setAttribute('aria-pressed', mode === 'erase' ? 'true' : 'false');
    setStatus(mode === 'draw' ? 'أداة الرسم مفعلة' : 'الممحاة مفعلة');
  }

  function commandAdded(command) {
    undoStack.push(command);
    redoStack.length = 0;
    updateHistoryButtons();
  }

  function canvasPoint(point) {
    return {
      x: viewOffsetX + point.x * viewScale,
      y: viewOffsetY + point.y * viewScale,
      width: Math.max(point.width * viewScale, 0.5)
    };
  }

  function prepareStroke(mode, width) {
    context.globalCompositeOperation =
      mode === 'erase' ? 'destination-out' : 'source-over';
    context.strokeStyle = inkColor;
    context.fillStyle = inkColor;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = width;
  }

  function drawDot(point, mode) {
    var displayed = canvasPoint(point);
    prepareStroke(mode, displayed.width);
    context.beginPath();
    context.arc(
      displayed.x,
      displayed.y,
      displayed.width / 2,
      0,
      Math.PI * 2
    );
    context.fill();
  }

  function drawPiece(first, second, mode) {
    var a = canvasPoint(first);
    var b = canvasPoint(second);
    var width = (a.width + b.width) / 2;
    var middleX = (a.x + b.x) / 2;
    var middleY = (a.y + b.y) / 2;

    prepareStroke(mode, width);
    context.beginPath();
    context.moveTo(a.x, a.y);
    context.quadraticCurveTo(a.x, a.y, middleX, middleY);
    context.quadraticCurveTo(middleX, middleY, b.x, b.y);
    context.stroke();
  }

  function renderStroke(stroke) {
    var points = stroke.points;
    var index;

    if (!points.length) {
      return;
    }

    drawDot(points[0], stroke.type);

    for (index = 1; index < points.length; index += 1) {
      drawPiece(points[index - 1], points[index], stroke.type);
    }
  }

  function clearBitmap() {
    context.save();
    context.setTransform(effectiveRatio, 0, 0, effectiveRatio, 0, 0);
    context.clearRect(0, 0, logicalWidth, logicalHeight);
    context.restore();
  }

  function replay() {
    var index;
    var command;

    clearBitmap();

    context.save();
    context.setTransform(effectiveRatio, 0, 0, effectiveRatio, 0, 0);

    for (index = 0; index < undoStack.length; index += 1) {
      command = undoStack[index];

      if (command.type === 'clear') {
        context.clearRect(0, 0, logicalWidth, logicalHeight);
      } else {
        renderStroke(command);
      }
    }

    context.restore();
  }

  function drawIncrement() {
    var sample;

    frameRequest = 0;

    if (!pendingSamples.length) {
      return;
    }

    context.save();
    context.setTransform(effectiveRatio, 0, 0, effectiveRatio, 0, 0);

    while (pendingSamples.length) {
      sample = pendingSamples.shift();

      if (renderCursor) {
        drawPiece(renderCursor, sample, activeMode);
      } else {
        drawDot(sample, activeMode);
      }

      renderCursor = sample;
    }

    context.restore();
  }

  function scheduleIncrement() {
    if (!frameRequest) {
      frameRequest = window.requestAnimationFrame(drawIncrement);
    }
  }

  function fitModelToCanvas() {
    var widthScale;
    var heightScale;

    if (!modelWidth || !modelHeight) {
      modelWidth = logicalWidth;
      modelHeight = logicalHeight;
    }

    widthScale = logicalWidth / modelWidth;
    heightScale = logicalHeight / modelHeight;
    viewScale = Math.min(widthScale, heightScale);
    viewOffsetX = (logicalWidth - modelWidth * viewScale) / 2;
    viewOffsetY = (logicalHeight - modelHeight * viewScale) / 2;
  }

  function resizeCanvas() {
    var rect = canvas.getBoundingClientRect();
    var requestedRatio;
    var limitedRatio;
    var availableRatio;

    resizeRequest = 0;

    if (!dialog.open || rect.width <= 0 || rect.height <= 0) {
      return;
    }

    logicalWidth = rect.width;
    logicalHeight = rect.height;
    requestedRatio = Math.max(window.devicePixelRatio || 1, 1);
    availableRatio = Math.sqrt(
      MAX_BACKING_PIXELS / (logicalWidth * logicalHeight)
    );
    limitedRatio = Math.min(requestedRatio, availableRatio);
    effectiveRatio = Math.max(limitedRatio, 0.1);

    canvas.width = Math.max(1, Math.floor(logicalWidth * effectiveRatio));
    canvas.height = Math.max(1, Math.floor(logicalHeight * effectiveRatio));

    fitModelToCanvas();
    replay();
  }

  function scheduleResize() {
    if (!resizeRequest) {
      resizeRequest = window.requestAnimationFrame(resizeCanvas);
    }
  }

  function pressureIsUseful(event) {
    return (
      event.pointerType === 'pen' &&
      event.pressure > 0 &&
      event.pressure < 1
    );
  }

  function sampleWidth(event, speed) {
    var minimum = Math.min(modelWidth, modelHeight);
    var base = Math.max(minimum * 0.006, 1.5);
    var factor;

    if (activeMode === 'erase') {
      return Math.max(minimum * 0.025, base * 3);
    }

    if (pressureIsUseful(event)) {
      smoothedPressure =
        smoothedPressure * 0.7 + Math.max(event.pressure, 0.05) * 0.3;
      factor = 0.55 + smoothedPressure * 1.25;
    } else {
      smoothedSpeed = smoothedSpeed * 0.72 + speed * 0.28;
      factor = 1.65 - Math.min(smoothedSpeed * 0.22, 0.9);
    }

    return Math.max(base * 0.45, Math.min(base * 1.9, base * factor));
  }

  function pointFromEvent(event) {
    var rect = canvas.getBoundingClientRect();
    var localX = event.clientX - rect.left;
    var localY = event.clientY - rect.top;
    var x = (localX - viewOffsetX) / viewScale;
    var y = (localY - viewOffsetY) / viewScale;
    var time = event.timeStamp || Date.now();
    var elapsed = Math.max(time - previousTime, 1);
    var distance = Math.hypot(x - previousX, y - previousY);
    var speed = previousTime ? distance / elapsed : 0;
    var width = sampleWidth(event, speed);

    x = Math.max(0, Math.min(modelWidth, x));
    y = Math.max(0, Math.min(modelHeight, y));

    previousTime = time;
    previousX = x;
    previousY = y;

    return {
      x: x,
      y: y,
      width: width,
      time: time
    };
  }

  function limitReached() {
    return (
      undoStack.length >= MAX_STROKES ||
      sessionPoints + activePoints.length >= MAX_SESSION_POINTS
    );
  }

  function queueEventSample(event) {
    var point;

    if (activePoints.length >= MAX_STROKE_POINTS || limitReached()) {
      setStatus('بلغت البورد حد الرسم لهذه الجلسة');
      return false;
    }

    point = pointFromEvent(event);
    activePoints.push(point);
    pendingSamples.push(point);
    return true;
  }

  function isPalmCandidate(event) {
    var contactArea;
    var surfaceArea;

    if (event.pointerType !== 'touch') {
      return false;
    }

    contactArea = Math.max(event.width, 1) * Math.max(event.height, 1);
    surfaceArea = Math.max(logicalWidth * logicalHeight, 1);

    return (
      !event.isPrimary ||
      activeTouchId !== null ||
      penActive ||
      contactArea / surfaceArea > 0.012
    );
  }

  function canStartPointer(event) {
    if (activePointerId !== null) {
      return false;
    }

    if (event.pointerType === 'mouse' && event.button !== 0) {
      return false;
    }

    if (
      event.pointerType !== 'touch' &&
      event.pointerType !== 'pen' &&
      event.pointerType !== 'mouse'
    ) {
      return false;
    }

    if (event.pointerType === 'touch' && isPalmCandidate(event)) {
      return false;
    }

    if (event.pointerType === 'touch' && !event.isPrimary) {
      return false;
    }

    if (event.pointerType === 'touch' && penActive) {
      return false;
    }

    return !limitReached();
  }

  function onPointerDown(event) {
    if (!canStartPointer(event)) {
      return;
    }

    event.preventDefault();

    activePointerId = event.pointerId;
    activePointerType = event.pointerType;
    activeTouchId = event.pointerType === 'touch' ? event.pointerId : null;
    penActive = event.pointerType === 'pen';
    activePoints = [];
    pendingSamples = [];
    renderCursor = null;
    previousTime = 0;
    smoothedPressure = 0.5;
    smoothedSpeed = 0;

    try {
      canvas.setPointerCapture(event.pointerId);
    } catch (error) {
      activePointerId = null;
      activeTouchId = null;
      activePointerType = null;
      penActive = false;
      setStatus('تعذر بدء الضربة');
      return;
    }

    if (queueEventSample(event)) {
      scheduleIncrement();
    }
  }

  function coalescedSamples(event) {
    if (typeof event.getCoalescedEvents === 'function') {
      return event.getCoalescedEvents();
    }

    return [event];
  }

  function onPointerMove(event) {
    var events;
    var index;

    if (event.pointerId !== activePointerId) {
      return;
    }

    event.preventDefault();
    events = coalescedSamples(event);

    for (index = 0; index < events.length; index += 1) {
      if (!queueEventSample(events[index])) {
        break;
      }
    }

    scheduleIncrement();
  }

  function resetActivePointer() {
    activePointerId = null;
    activeTouchId = null;
    activePointerType = null;
    penActive = false;
    activePoints = [];
    pendingSamples = [];
    renderCursor = null;
    previousTime = 0;
  }

  function finishStroke(event, cancelled) {
    var command;

    if (event.pointerId !== activePointerId) {
      return;
    }

    event.preventDefault();

    if (!cancelled) {
      queueEventSample(event);
    }

    if (frameRequest) {
      window.cancelAnimationFrame(frameRequest);
      frameRequest = 0;
    }

    drawIncrement();

    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }

    if (!cancelled && activePoints.length) {
      command = {
        type: activeMode,
        pointerType: activePointerType,
        points: activePoints.slice()
      };
      sessionPoints += command.points.length;
      commandAdded(command);
      setStatus(activeMode === 'draw' ? 'تمت إضافة ضربة' : 'تم المحو');
    } else if (cancelled) {
      replay();
      setStatus('أُلغيت الضربة');
    }

    resetActivePointer();
  }

  function onPointerUp(event) {
    finishStroke(event, false);
  }

  function onPointerCancel(event) {
    finishStroke(event, true);
  }

  function undo() {
    var command;

    if (!undoStack.length || activePointerId !== null) {
      return;
    }

    command = undoStack.pop();
    redoStack.push(command);
    replay();
    updateHistoryButtons();
    setStatus('تم التراجع');
  }

  function redo() {
    var command;

    if (!redoStack.length || activePointerId !== null) {
      return;
    }

    command = redoStack.pop();
    undoStack.push(command);
    replay();
    updateHistoryButtons();
    setStatus('تمت الإعادة');
  }

  function clearAll() {
    if (!undoStack.length || activePointerId !== null) {
      return;
    }

    commandAdded({ type: 'clear' });
    clearBitmap();
    setStatus('تم مسح البورد ويمكن التراجع');
  }

  function openBoard() {
    if (dialog.open) {
      return;
    }

    dialog.showModal();
    window.requestAnimationFrame(function () {
      resizeCanvas();
      drawButton.focus();
    });
  }

  function closeBoard() {
    if (dialog.open) {
      dialog.close();
    }
  }

  function onDialogCancel(event) {
    event.preventDefault();
    dialog.close();
  }

  function onDialogClose() {
    if (activePointerId !== null) {
      resetActivePointer();
      replay();
    }

    openButton.focus();
  }

  function buildInterface() {
    var title;
    var toolbar;
    var canvasWrap;

    root = document.createElement('div');
    root.className = 'pg-lesson-board-root';

    openButton = makeButton(
      'فتح البورد',
      'pg-lesson-board-open pg-lesson-board-button'
    );
    openButton.setAttribute('aria-haspopup', 'dialog');

    dialog = document.createElement('dialog');
    dialog.className = 'pg-lesson-board-dialog';
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'pg-lesson-board-title');

    title = document.createElement('h2');
    title.id = 'pg-lesson-board-title';
    title.className = 'pg-lesson-board-title';
    title.textContent = 'بورد الدرس';

    toolbar = document.createElement('div');
    toolbar.className = 'pg-lesson-board-toolbar';
    toolbar.setAttribute('aria-label', 'أدوات البورد');

    drawButton = makeButton(
      'رسم',
      'pg-lesson-board-button pg-lesson-board-tool'
    );
    eraseButton = makeButton(
      'ممحاة',
      'pg-lesson-board-button pg-lesson-board-tool'
    );
    undoButton = makeButton('تراجع', 'pg-lesson-board-button');
    redoButton = makeButton('إعادة', 'pg-lesson-board-button');
    clearButton = makeButton('مسح الكل', 'pg-lesson-board-button');
    closeButton = makeButton('إخفاء البورد', 'pg-lesson-board-button');

    drawButton.setAttribute('aria-pressed', 'true');
    eraseButton.setAttribute('aria-pressed', 'false');

    toolbar.appendChild(drawButton);
    toolbar.appendChild(eraseButton);
    toolbar.appendChild(undoButton);
    toolbar.appendChild(redoButton);
    toolbar.appendChild(clearButton);
    toolbar.appendChild(closeButton);

    canvasWrap = document.createElement('div');
    canvasWrap.className = 'pg-lesson-board-surface';

    canvas = document.createElement('canvas');
    canvas.className = 'pg-lesson-board-canvas';
    canvas.setAttribute('aria-label', 'مساحة الرسم على البورد');

    context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Canvas unavailable');
    }

    canvasWrap.appendChild(canvas);

    status = document.createElement('p');
    status.className = 'pg-lesson-board-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.textContent = 'البورد جاهزة للرسم بالإصبع';

    dialog.appendChild(title);
    dialog.appendChild(toolbar);
    dialog.appendChild(canvasWrap);
    dialog.appendChild(status);

    root.appendChild(openButton);
    root.appendChild(dialog);

    inkColor = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue('--pg-navy-700')
      .trim();

    if (!inkColor) {
      throw new Error('Ink token unavailable');
    }
  }

  function bindEvents() {
    openButton.addEventListener('click', openBoard);
    closeButton.addEventListener('click', closeBoard);
    drawButton.addEventListener('click', function () {
      setMode('draw');
    });
    eraseButton.addEventListener('click', function () {
      setMode('erase');
    });
    undoButton.addEventListener('click', undo);
    redoButton.addEventListener('click', redo);
    clearButton.addEventListener('click', clearAll);

    dialog.addEventListener('cancel', onDialogCancel);
    dialog.addEventListener('close', onDialogClose);

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerCancel);

    window.addEventListener('resize', scheduleResize);
    window.addEventListener('orientationchange', scheduleResize);
  }

  function initialise() {
    try {
      buildInterface();
      bindEvents();
      updateHistoryButtons();
      controls.parentNode.insertBefore(root, controls.nextSibling);
    } catch (error) {
      if (root && root.parentNode) {
        root.parentNode.removeChild(root);
      }
      root = null;
    }
  }

  initialise();
}());
