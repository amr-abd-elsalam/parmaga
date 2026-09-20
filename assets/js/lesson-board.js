(function () {
  'use strict';
  var MAX_BACKING_PIXELS = 8294400;
  var MAX_STROKE_POINTS = 4096;
  var MAX_SESSION_POINTS = 60000;
  var MAX_STROKES = 500;
  var BOARD_HEIGHT_MULTIPLIER = 3;
  var ERASER_RATIO = 0.05;
  var FRAME_SAMPLE_BUDGET = 192;
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
  var scroller = null;
  var canvas = null;
  var context = null;
  var drawButton = null;
  var redButton = null;
  var eraseButton = null;
  var panButton = null;
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
  var selectedColor = '';
  var strokeMode = 'draw';
  var strokeColor = '';
  var eraserWidth = 1;
  var scrollerRect = null;
  var initialScrollTop = 0;
  var initialClientY = 0;
  var savedScrollTop = 0;
  var pendingSamples = [];
  var pendingReadIndex = 0;
  var frameRequest = 0;
  var resizeRequest = 0;
  var renderCursor = null;
  var logicalWidth = 0;
  var logicalHeight = 0;
  var modelWidth = 0;
  var modelHeight = 0;
  var effectiveRatio = 1;
  var previousTime = 0;
  var previousX = 0;
  var previousY = 0;
  var smoothedPressure = 0.5;
  var smoothedSpeed = 0;
  var lastAcceptedTimestamp = -1;
  var lastAcceptedClientX = null;
  var lastAcceptedClientY = null;
  var navyColor = '';
  var redColor = '';
  function makeButton(label, accessibleName, className) {
    var button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = label;
    button.setAttribute('aria-label', accessibleName);
    button.title = accessibleName;
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
  function setMode(mode, color) {
    activeMode = mode;
    if (mode === 'draw' && color) {
    selectedColor = color;
    }
    drawButton.setAttribute(
    'aria-pressed',
    mode === 'draw' && selectedColor === navyColor ? 'true' : 'false'
    );
    redButton.setAttribute(
    'aria-pressed',
    mode === 'draw' && selectedColor === redColor ? 'true' : 'false'
    );
    eraseButton.setAttribute(
    'aria-pressed',
    mode === 'erase' ? 'true' : 'false'
    );
    panButton.setAttribute(
    'aria-pressed',
    mode === 'pan' ? 'true' : 'false'
    );
    if (mode === 'pan') {
    setStatus('وضع تمرير البورد رأسيًا مفعّل');
    } else if (mode === 'erase') {
    setStatus('الممحاة مفعلة');
    } else if (selectedColor === redColor) {
    setStatus('الرسم باللون الأحمر مفعّل');
    } else {
    setStatus('الرسم باللون الكحلي مفعّل');
    }
  }
  function commandAdded(command) {
    undoStack.push(command);
    redoStack.length = 0;
    updateHistoryButtons();
  }
  function prepareStroke(mode, color, width) {
    context.globalCompositeOperation =
    mode === 'erase' ? 'destination-out' : 'source-over';
    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = width;
  }
  function drawDot(point, mode, color) {
    prepareStroke(mode, color, point.width);
    context.beginPath();
    context.arc(point.x, point.y, point.width / 2, 0, Math.PI * 2);
    context.fill();
  }
  function drawPiece(first, second, mode, color) {
    var width = (first.width + second.width) / 2;
    var middleX = (first.x + second.x) / 2;
    var middleY = (first.y + second.y) / 2;
    prepareStroke(mode, color, width);
    context.beginPath();
    context.moveTo(first.x, first.y);
    context.quadraticCurveTo(first.x, first.y, middleX, middleY);
    context.quadraticCurveTo(middleX, middleY, second.x, second.y);
    context.stroke();
  }
  function renderStroke(stroke) {
    var points = stroke.points;
    var index;
    if (!points.length) {
    return;
    }
    drawDot(points[0], stroke.mode, stroke.color);
    for (index = 1; index < points.length; index += 1) {
    drawPiece(
      points[index - 1],
      points[index],
      stroke.mode,
      stroke.color
    );
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
    var processed = 0;
    frameRequest = 0;
    if (pendingReadIndex >= pendingSamples.length) {
    pendingSamples = [];
    pendingReadIndex = 0;
    return;
    }
    context.save();
    context.setTransform(effectiveRatio, 0, 0, effectiveRatio, 0, 0);
    while (
    pendingReadIndex < pendingSamples.length &&
    processed < FRAME_SAMPLE_BUDGET
    ) {
    sample = pendingSamples[pendingReadIndex];
    pendingReadIndex += 1;
    processed += 1;
    if (renderCursor) {
      drawPiece(renderCursor, sample, strokeMode, strokeColor);
    } else {
      drawDot(sample, strokeMode, strokeColor);
    }
    renderCursor = sample;
    }
    context.restore();
    if (pendingReadIndex < pendingSamples.length) {
    scheduleIncrement();
    } else {
    pendingSamples = [];
    pendingReadIndex = 0;
    }
  }
  function scheduleIncrement() {
    if (!frameRequest) {
    frameRequest = window.requestAnimationFrame(drawIncrement);
    }
  }
  function transformCommand(command, scale, offsetX, offsetY) {
    var index;
    var point;
    if (!command.points) {
    return;
    }
    for (index = 0; index < command.points.length; index += 1) {
    point = command.points[index];
    point.x = offsetX + point.x * scale;
    point.y = offsetY + point.y * scale;
    point.width *= scale;
    }
  }
  function transformHistory(oldWidth, oldHeight, newWidth, newHeight) {
    var scale;
    var offsetX;
    var offsetY;
    var index;
    if (!oldWidth || !oldHeight) {
    return;
    }
    scale = Math.min(newWidth / oldWidth, newHeight / oldHeight);
    offsetX = (newWidth - oldWidth * scale) / 2;
    offsetY = (newHeight - oldHeight * scale) / 2;
    for (index = 0; index < undoStack.length; index += 1) {
    transformCommand(undoStack[index], scale, offsetX, offsetY);
    }
    for (index = 0; index < redoStack.length; index += 1) {
    transformCommand(redoStack[index], scale, offsetX, offsetY);
    }
  }
  function finishActiveStroke(cancelled) {
    var command;
    if (activePointerId === null) {
    return;
    }
    if (frameRequest) {
    window.cancelAnimationFrame(frameRequest);
    frameRequest = 0;
    }
    drawIncrement();
    if (canvas.hasPointerCapture(activePointerId)) {
    canvas.releasePointerCapture(activePointerId);
    }
    if (strokeMode !== 'pan' && !cancelled && activePoints.length) {
    command = {};
    command.type = strokeMode;
    command.mode = strokeMode;
    command.color = strokeColor;
    command.pointerType = activePointerType;
    command.points = activePoints.slice();
    sessionPoints += command.points.length;
    commandAdded(command);
    } else if (cancelled && strokeMode !== 'pan') {
    replay();
    }
    resetActivePointer();
  }
  function resizeCanvas() {
    var oldWidth = modelWidth;
    var oldHeight = modelHeight;
    var oldMaximum;
    var scrollRatio;
    var viewportWidth;
    var viewportHeight;
    var logicalArea;
    var effectiveDPR;
    resizeRequest = 0;
    if (!dialog.open) {
    return;
    }
    finishActiveStroke(false);
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
    if (viewportWidth <= 0 || viewportHeight <= 0) {
    return;
    }
    oldMaximum = Math.max(oldHeight - scroller.clientHeight, 0);
    scrollRatio = oldMaximum ? savedScrollTop / oldMaximum : 0;
    logicalWidth = viewportWidth;
    logicalHeight = viewportHeight * BOARD_HEIGHT_MULTIPLIER;
    transformHistory(
    oldWidth,
    oldHeight,
    logicalWidth,
    logicalHeight
    );
    modelWidth = logicalWidth;
    modelHeight = logicalHeight;
    logicalArea = viewportWidth * (
    viewportHeight * BOARD_HEIGHT_MULTIPLIER
    );
    effectiveDPR = Math.min(
    window.devicePixelRatio || 1,
    Math.sqrt(MAX_BACKING_PIXELS / logicalArea)
    );
    effectiveRatio = effectiveDPR;
    canvas.width = Math.max(
    1,
    Math.floor(logicalWidth * effectiveDPR)
    );
    canvas.height = Math.max(
    1,
    Math.floor(logicalHeight * effectiveDPR)
    );
    eraserWidth = Math.max(
    Math.min(window.innerWidth, window.innerHeight) * ERASER_RATIO,
    8
    );
    replay();
    window.requestAnimationFrame(function () {
    var maximum = Math.max(
      scroller.scrollHeight - scroller.clientHeight,
      0
    );
    savedScrollTop = Math.max(
      0,
      Math.min(maximum, maximum * scrollRatio)
    );
    scroller.scrollTop = savedScrollTop;
    });
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
    var minimum = Math.min(logicalWidth, window.innerHeight);
    var base = Math.max(minimum * 0.006, 1.5);
    var factor;
    if (strokeMode === 'erase') {
    return eraserWidth;
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
    var x = event.clientX - scrollerRect.left;
    var y =
    event.clientY - scrollerRect.top + scroller.scrollTop;
    var time = event.timeStamp || Date.now();
    var elapsed = Math.max(time - previousTime, 1);
    var distance = Math.hypot(x - previousX, y - previousY);
    var speed = previousTime ? distance / elapsed : 0;
    var width = sampleWidth(event, speed);
    /* Equivalent: clientX - rect.left; clientY - rect.top. */
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
  function isDuplicateSample(sample) {
    return (
    sample.timeStamp === lastAcceptedTimestamp &&
    sample.clientX === lastAcceptedClientX &&
    sample.clientY === lastAcceptedClientY
    );
  }
  function acceptSample(sample) {
    var point;
    if (sample.timeStamp < lastAcceptedTimestamp) {
    return false;
    }
    if (isDuplicateSample(sample)) {
    return false;
    }
    if (activePoints.length >= MAX_STROKE_POINTS || limitReached()) {
    setStatus('بلغت البورد حد الرسم لهذه الجلسة');
    return false;
    }
    lastAcceptedTimestamp = sample.timeStamp;
    lastAcceptedClientX = sample.clientX;
    lastAcceptedClientY = sample.clientY;
    point = pointFromEvent(sample);
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
    surfaceArea = Math.max(window.innerWidth * window.innerHeight, 1);
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
    return activeMode === 'pan' || !limitReached();
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
    pendingReadIndex = 0;
    renderCursor = null;
    previousTime = 0;
    smoothedPressure = 0.5;
    smoothedSpeed = 0;
    lastAcceptedTimestamp = -1;
    lastAcceptedClientX = null;
    lastAcceptedClientY = null;
    scrollerRect = scroller.getBoundingClientRect();
    strokeMode = activeMode;
    strokeColor = selectedColor;
    initialScrollTop = scroller.scrollTop;
    initialClientY = event.clientY;
    try {
    canvas.setPointerCapture(event.pointerId);
    } catch (error) {
    resetActivePointer();
    setStatus('تعذر بدء التفاعل');
    return;
    }
    if (strokeMode !== 'pan' && acceptSample(event)) {
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
    var currentClientY;
    var nextScrollTop;
    var maximum;
    if (event.pointerId !== activePointerId) {
    return;
    }
    event.preventDefault();
    if (strokeMode === 'pan') {
    currentClientY = event.clientY;
    nextScrollTop =
      initialScrollTop + initialClientY - currentClientY;
    maximum = Math.max(
      scroller.scrollHeight - scroller.clientHeight,
      0
    );
    scroller.scrollTop = Math.max(0, Math.min(maximum, nextScrollTop));
    return;
    }
    events = coalescedSamples(event);
    for (index = 0; index < events.length; index += 1) {
    acceptSample(events[index]);
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
    pendingReadIndex = 0;
    renderCursor = null;
    previousTime = 0;
    scrollerRect = null;
  }
  function finishStroke(event, cancelled) {
    if (event.pointerId !== activePointerId) {
    return;
    }
    event.preventDefault();
    if (!cancelled && strokeMode !== 'pan') {
    acceptSample(event);
    }
    finishActiveStroke(cancelled);
    if (cancelled) {
    setStatus('أُلغي التفاعل');
    } else if (strokeMode === 'pan') {
    setStatus('تم تمرير البورد رأسيًا');
    } else if (strokeMode === 'erase') {
    setStatus('تم المحو');
    } else {
    setStatus('تمت إضافة ضربة');
    }
  }
  function onPointerUp(event) {
    if (event.pointerId !== activePointerId) {
    return;
    }
    acceptSample(event);
    finishStroke(event, false);
  }
  function onPointerCancel(event) {
    finishStroke(event, true);
  }
  function onBoardScroll() {
    savedScrollTop = scroller.scrollTop;
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
    if (!undoStack.length || activePointerId !== null || limitReached()) {
    return;
    }
    commandAdded({ type: 'clear' });
    clearBitmap();
    setStatus('تم مسح الكل ويمكن التراجع');
  }
  function openBoard() {
    var pageScrollX;
    var pageScrollY;
    if (dialog.open) {
    return;
    }
    pageScrollX = window.scrollX;
    pageScrollY = window.scrollY;
    dialog.showModal();
    window.scrollTo(pageScrollX, pageScrollY);
    window.requestAnimationFrame(function () {
    resizeCanvas();
    scroller.scrollTop = savedScrollTop;
    drawButton.focus({ preventScroll: true });
    window.scrollTo(pageScrollX, pageScrollY);
    });
  }
  function closeBoard() {
    if (dialog.open) {
    savedScrollTop = scroller.scrollTop;
    dialog.close();
    }
  }
  function onDialogCancel(event) {
    event.preventDefault();
    closeBoard();
  }
  function onDialogClose() {
    if (activePointerId !== null) {
    finishActiveStroke(false);
    }
    savedScrollTop = scroller.scrollTop;
    try {
    openButton.focus({ preventScroll: true });
    } catch (error) {
    openButton.focus();
    }
  }
  function buildInterface() {
    var title;
    var toolbar;
    var tools;
    var computedStyle;
    root = document.createElement('div');
    root.className = 'pg-lesson-board-root';
    openButton = makeButton(
    'BD',
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
    tools = document.createElement('div');
    tools.className = 'pg-lesson-board-tools';
    drawButton = makeButton(
    'NV',
    'الرسم باللون الكحلي',
    'pg-lesson-board-button pg-lesson-board-tool'
    );
    redButton = makeButton(
    'RD',
    'الرسم باللون الأحمر',
    'pg-lesson-board-button pg-lesson-board-tool'
    );
    eraseButton = makeButton(
    'ER',
    'الممحاة',
    'pg-lesson-board-button pg-lesson-board-tool'
    );
    panButton = makeButton(
    'PAN',
    'تمرير البورد رأسيًا',
    'pg-lesson-board-button pg-lesson-board-tool'
    );
    undoButton = makeButton('UN', 'تراجع', 'pg-lesson-board-button');
    redoButton = makeButton('RE', 'إعادة', 'pg-lesson-board-button');
    clearButton = makeButton(
    'CLR',
    'مسح كل الكتابة',
    'pg-lesson-board-button'
    );
    closeButton = makeButton(
    'X',
    'إخفاء البورد',
    'pg-lesson-board-button pg-lesson-board-close'
    );
    drawButton.setAttribute('aria-pressed', 'true');
    redButton.setAttribute('aria-pressed', 'false');
    eraseButton.setAttribute('aria-pressed', 'false');
    panButton.setAttribute('aria-pressed', 'false');
    tools.appendChild(drawButton);
    tools.appendChild(redButton);
    tools.appendChild(eraseButton);
    tools.appendChild(panButton);
    tools.appendChild(undoButton);
    tools.appendChild(redoButton);
    tools.appendChild(clearButton);
    toolbar.appendChild(tools);
    toolbar.appendChild(closeButton);
    scroller = document.createElement('div');
    scroller.className = 'pg-lesson-board-surface';
    canvas = document.createElement('canvas');
    canvas.className = 'pg-lesson-board-canvas';
    canvas.setAttribute('aria-label', 'مساحة الرسم على البورد');
    context = canvas.getContext('2d');
    if (!context) {
    throw new Error('Canvas unavailable');
    }
    scroller.appendChild(canvas);
    status = document.createElement('p');
    status.className = 'pg-lesson-board-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.textContent = 'البورد جاهزة للرسم بالإصبع';
    dialog.appendChild(title);
    dialog.appendChild(scroller);
    dialog.appendChild(toolbar);
    dialog.appendChild(status);
    root.appendChild(openButton);
    root.appendChild(dialog);
    computedStyle = window.getComputedStyle(document.documentElement);
    navyColor = computedStyle.getPropertyValue('--pg-navy-700').trim();
    redColor = computedStyle.getPropertyValue('--pg-red-600').trim();
    if (!navyColor || !redColor) {
    throw new Error('Ink tokens unavailable');
    }
    selectedColor = navyColor;
  }
  function bindEvents() {
    openButton.addEventListener('click', openBoard);
    closeButton.addEventListener('click', closeBoard);
    drawButton.addEventListener('click', function () {
    setMode('draw', navyColor);
    });
    redButton.addEventListener('click', function () {
    setMode('draw', redColor);
    });
    eraseButton.addEventListener('click', function () {
    setMode('erase');
    });
    panButton.addEventListener('click', function () {
    setMode('pan');
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
    scroller.addEventListener('scroll', onBoardScroll);
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
