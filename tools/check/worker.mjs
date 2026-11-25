import { createRequire } from "node:module";
var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// node_modules/.bun/@jitl+quickjs-ffi-types@0.32.0/node_modules/@jitl/quickjs-ffi-types/dist/index.mjs
var EvalFlags, IntrinsicsFlags, JSPromiseStateEnum, GetOwnPropertyNamesFlags, IsEqualOp;
var init_dist = __esm(() => {
  EvalFlags = { JS_EVAL_TYPE_GLOBAL: 0, JS_EVAL_TYPE_MODULE: 1, JS_EVAL_TYPE_DIRECT: 2, JS_EVAL_TYPE_INDIRECT: 3, JS_EVAL_TYPE_MASK: 3, JS_EVAL_FLAG_STRICT: 8, JS_EVAL_FLAG_STRIP: 16, JS_EVAL_FLAG_COMPILE_ONLY: 32, JS_EVAL_FLAG_BACKTRACE_BARRIER: 64 };
  IntrinsicsFlags = { BaseObjects: 1, Date: 2, Eval: 4, StringNormalize: 8, RegExp: 16, RegExpCompiler: 32, JSON: 64, Proxy: 128, MapSet: 256, TypedArrays: 512, Promise: 1024, BigInt: 2048, BigFloat: 4096, BigDecimal: 8192, OperatorOverloading: 16384, BignumExt: 32768 };
  JSPromiseStateEnum = { Pending: 0, Fulfilled: 1, Rejected: 2 };
  GetOwnPropertyNamesFlags = { JS_GPN_STRING_MASK: 1, JS_GPN_SYMBOL_MASK: 2, JS_GPN_PRIVATE_MASK: 4, JS_GPN_ENUM_ONLY: 16, JS_GPN_SET_ENUM: 32, QTS_GPN_NUMBER_MASK: 64, QTS_STANDARD_COMPLIANT_NUMBER: 128 };
  IsEqualOp = { IsStrictlyEqual: 0, IsSameValue: 1, IsSameValueZero: 2 };
});

// node_modules/.bun/quickjs-emscripten-core@0.32.0/node_modules/quickjs-emscripten-core/dist/chunk-V2S4ZYJR.mjs
function debugLog(...args) {
  QTS_DEBUG && console.log("quickjs-emscripten:", ...args);
}
function* awaitYield(value) {
  return yield value;
}
function awaitYieldOf(generator) {
  return awaitYield(awaitEachYieldedPromise(generator));
}
function maybeAsyncFn(that, fn) {
  return (...args) => {
    let generator = fn.call(that, AwaitYield, ...args);
    return awaitEachYieldedPromise(generator);
  };
}
function maybeAsync(that, startGenerator) {
  let generator = startGenerator.call(that, AwaitYield);
  return awaitEachYieldedPromise(generator);
}
function awaitEachYieldedPromise(gen) {
  function handleNextStep(step) {
    return step.done ? step.value : step.value instanceof Promise ? step.value.then((value) => handleNextStep(gen.next(value)), (error) => handleNextStep(gen.throw(error))) : handleNextStep(gen.next(step.value));
  }
  return handleNextStep(gen.next());
}
function scopeFinally(scope, blockError) {
  let disposeError;
  try {
    scope.dispose();
  } catch (error) {
    disposeError = error;
  }
  if (blockError && disposeError)
    throw Object.assign(blockError, { message: `${blockError.message}
 Then, failed to dispose scope: ${disposeError.message}`, disposeError }), blockError;
  if (blockError || disposeError)
    throw blockError || disposeError;
}
function createDisposableArray(items) {
  let array = items ? Array.from(items) : [];
  function disposeAlive() {
    return array.forEach((disposable) => disposable.alive ? disposable.dispose() : undefined);
  }
  function someIsAlive() {
    return array.some((disposable) => disposable.alive);
  }
  return Object.defineProperty(array, SymbolDispose, { configurable: true, enumerable: false, value: disposeAlive }), Object.defineProperty(array, "dispose", { configurable: true, enumerable: false, value: disposeAlive }), Object.defineProperty(array, "alive", { configurable: true, enumerable: false, get: someIsAlive }), array;
}
function isDisposable(value) {
  return !!(value && (typeof value == "object" || typeof value == "function") && ("alive" in value) && typeof value.alive == "boolean" && ("dispose" in value) && typeof value.dispose == "function");
}
function intrinsicsToFlags(intrinsics) {
  if (!intrinsics)
    return 0;
  let result = 0;
  for (let [maybeIntrinsicName, enabled] of Object.entries(intrinsics)) {
    if (!(maybeIntrinsicName in IntrinsicsFlags))
      throw new QuickJSUnknownIntrinsic(maybeIntrinsicName);
    enabled && (result |= IntrinsicsFlags[maybeIntrinsicName]);
  }
  return result;
}
function evalOptionsToFlags(evalOptions) {
  if (typeof evalOptions == "number")
    return evalOptions;
  if (evalOptions === undefined)
    return 0;
  let { type, strict, strip, compileOnly, backtraceBarrier } = evalOptions, flags = 0;
  return type === "global" && (flags |= EvalFlags.JS_EVAL_TYPE_GLOBAL), type === "module" && (flags |= EvalFlags.JS_EVAL_TYPE_MODULE), strict && (flags |= EvalFlags.JS_EVAL_FLAG_STRICT), strip && (flags |= EvalFlags.JS_EVAL_FLAG_STRIP), compileOnly && (flags |= EvalFlags.JS_EVAL_FLAG_COMPILE_ONLY), backtraceBarrier && (flags |= EvalFlags.JS_EVAL_FLAG_BACKTRACE_BARRIER), flags;
}
function getOwnPropertyNamesOptionsToFlags(options) {
  if (typeof options == "number")
    return options;
  if (options === undefined)
    return 0;
  let { strings: includeStrings, symbols: includeSymbols, quickjsPrivate: includePrivate, onlyEnumerable, numbers: includeNumbers, numbersAsStrings } = options, flags = 0;
  return includeStrings && (flags |= GetOwnPropertyNamesFlags.JS_GPN_STRING_MASK), includeSymbols && (flags |= GetOwnPropertyNamesFlags.JS_GPN_SYMBOL_MASK), includePrivate && (flags |= GetOwnPropertyNamesFlags.JS_GPN_PRIVATE_MASK), onlyEnumerable && (flags |= GetOwnPropertyNamesFlags.JS_GPN_ENUM_ONLY), includeNumbers && (flags |= GetOwnPropertyNamesFlags.QTS_GPN_NUMBER_MASK), numbersAsStrings && (flags |= GetOwnPropertyNamesFlags.QTS_STANDARD_COMPLIANT_NUMBER), flags;
}
function concat(...values) {
  let result = [];
  for (let value of values)
    value !== undefined && (result = result.concat(value));
  return result;
}
function getGroupId(id) {
  return id >> 8;
}
function applyBaseRuntimeOptions(runtime, options) {
  options.interruptHandler && runtime.setInterruptHandler(options.interruptHandler), options.maxStackSizeBytes !== undefined && runtime.setMaxStackSize(options.maxStackSizeBytes), options.memoryLimitBytes !== undefined && runtime.setMemoryLimit(options.memoryLimitBytes);
}
function applyModuleEvalRuntimeOptions(runtime, options) {
  options.moduleLoader && runtime.setModuleLoader(options.moduleLoader), options.shouldInterrupt && runtime.setInterruptHandler(options.shouldInterrupt), options.memoryLimitBytes !== undefined && runtime.setMemoryLimit(options.memoryLimitBytes), options.maxStackSizeBytes !== undefined && runtime.setMaxStackSize(options.maxStackSizeBytes);
}
var __defProp2, __export2 = (target, all) => {
  for (var name in all)
    __defProp2(target, name, { get: all[name], enumerable: true });
}, QTS_DEBUG = false, errors_exports, QuickJSUnwrapError, QuickJSWrongOwner, QuickJSUseAfterFree, QuickJSNotImplemented, QuickJSAsyncifyError, QuickJSAsyncifySuspended, QuickJSMemoryLeakDetected, QuickJSEmscriptenModuleError, QuickJSUnknownIntrinsic, QuickJSPromisePending, QuickJSEmptyGetOwnPropertyNames, QuickJSHostRefRangeExceeded, QuickJSHostRefInvalid, AwaitYield, UsingDisposable, SymbolDispose, prototypeAsAny, Lifetime, StaticLifetime, WeakLifetime, Scope, AbstractDisposableResult, DisposableSuccess, DisposableFail, DisposableResult, QuickJSDeferredPromise, ModuleMemory = class {
  constructor(module) {
    this.module = module;
  }
  toPointerArray(handleArray) {
    let typedArray = new Int32Array(handleArray.map((handle) => handle.value)), numBytes = typedArray.length * typedArray.BYTES_PER_ELEMENT, ptr = this.module._malloc(numBytes);
    return new Uint8Array(this.module.HEAPU8.buffer, ptr, numBytes).set(new Uint8Array(typedArray.buffer)), new Lifetime(ptr, undefined, (ptr2) => this.module._free(ptr2));
  }
  newTypedArray(kind, length) {
    let zeros = new kind(new Array(length).fill(0)), numBytes = zeros.length * zeros.BYTES_PER_ELEMENT, ptr = this.module._malloc(numBytes), typedArray = new kind(this.module.HEAPU8.buffer, ptr, length);
    return typedArray.set(zeros), new Lifetime({ typedArray, ptr }, undefined, (value) => this.module._free(value.ptr));
  }
  newMutablePointerArray(length) {
    return this.newTypedArray(Int32Array, length);
  }
  newHeapCharPointer(string) {
    let strlen = this.module.lengthBytesUTF8(string), dataBytes = strlen + 1, ptr = this.module._malloc(dataBytes);
    return this.module.stringToUTF8(string, ptr, dataBytes), new Lifetime({ ptr, strlen }, undefined, (value) => this.module._free(value.ptr));
  }
  newHeapBufferPointer(buffer) {
    let numBytes = buffer.byteLength, ptr = this.module._malloc(numBytes);
    return this.module.HEAPU8.set(buffer, ptr), new Lifetime({ pointer: ptr, numBytes }, undefined, (value) => this.module._free(value.pointer));
  }
  consumeHeapCharPointer(ptr) {
    let str = this.module.UTF8ToString(ptr);
    return this.module._free(ptr), str;
  }
}, UnstableSymbol, DefaultIntrinsics, QuickJSIterator, INT32_MIN = -2147483648, INT32_MAX = 2147483647, INVALID_HOST_REF_ID = 0, HostRefMap = class {
  constructor() {
    this.nextId = INT32_MIN;
    this.freelist = [];
    this.groups = new Map;
  }
  put(value) {
    let id = this.allocateId(), groupId = getGroupId(id), group = this.groups.get(groupId);
    return group || (group = new Map, this.groups.set(groupId, group)), group.set(id, value), id;
  }
  get(id) {
    if (id === INVALID_HOST_REF_ID)
      throw new QuickJSHostRefInvalid("no host reference id defined");
    let groupId = getGroupId(id), group = this.groups.get(groupId);
    if (!group)
      throw new QuickJSHostRefInvalid(`host reference id ${id} is not defined`);
    let value = group.get(id);
    if (!value)
      throw new QuickJSHostRefInvalid(`host reference id ${id} is not defined`);
    return value;
  }
  delete(id) {
    if (id === INVALID_HOST_REF_ID)
      throw new QuickJSHostRefInvalid("no host reference id defined");
    let groupId = getGroupId(id), group = this.groups.get(groupId);
    if (!group)
      throw new QuickJSHostRefInvalid(`host reference id ${id} is not defined`);
    group.delete(id), group.size === 0 && this.groups.delete(groupId), this.freelist.push(id);
  }
  allocateId() {
    if (this.freelist.length > 0)
      return this.freelist.shift();
    if (this.nextId === INVALID_HOST_REF_ID && this.nextId++, this.nextId > INT32_MAX)
      throw new QuickJSHostRefRangeExceeded(`HostRefMap: too many host refs created without disposing. Max simultaneous host refs: ${INT32_MAX - INT32_MIN}`);
    return this.nextId++;
  }
}, HostRef, ContextMemory, QuickJSContext, QuickJSRuntime, QuickJSEmscriptenModuleCallbacks = class {
  constructor(args) {
    this.freeHostRef = args.freeHostRef, this.callFunction = args.callFunction, this.shouldInterrupt = args.shouldInterrupt, this.loadModuleSource = args.loadModuleSource, this.normalizeModule = args.normalizeModule;
  }
}, QuickJSModuleCallbacks = class {
  constructor(module) {
    this.contextCallbacks = new Map;
    this.runtimeCallbacks = new Map;
    this.suspendedCount = 0;
    this.cToHostCallbacks = new QuickJSEmscriptenModuleCallbacks({ freeHostRef: (_asyncify, rt, host_ref_id) => {
      let runtimeCallbacks = this.runtimeCallbacks.get(rt);
      if (!runtimeCallbacks)
        throw new Error(`QuickJSRuntime(rt = ${rt}) not found when trying to free HostRef(id = ${host_ref_id})`);
      runtimeCallbacks.freeHostRef(rt, host_ref_id);
    }, callFunction: (asyncify, ctx, this_ptr, argc, argv, fn_id) => this.handleAsyncify(asyncify, () => {
      try {
        let vm = this.contextCallbacks.get(ctx);
        if (!vm)
          throw new Error(`QuickJSContext(ctx = ${ctx}) not found for C function call "${fn_id}"`);
        return vm.callFunction(ctx, this_ptr, argc, argv, fn_id);
      } catch (error) {
        return console.error("[C to host error: returning null]", error), 0;
      }
    }), shouldInterrupt: (asyncify, rt) => this.handleAsyncify(asyncify, () => {
      try {
        let vm = this.runtimeCallbacks.get(rt);
        if (!vm)
          throw new Error(`QuickJSRuntime(rt = ${rt}) not found for C interrupt`);
        return vm.shouldInterrupt(rt);
      } catch (error) {
        return console.error("[C to host interrupt: returning error]", error), 1;
      }
    }), loadModuleSource: (asyncify, rt, ctx, moduleName) => this.handleAsyncify(asyncify, () => {
      try {
        let runtimeCallbacks = this.runtimeCallbacks.get(rt);
        if (!runtimeCallbacks)
          throw new Error(`QuickJSRuntime(rt = ${rt}) not found for C module loader`);
        let loadModule = runtimeCallbacks.loadModuleSource;
        if (!loadModule)
          throw new Error(`QuickJSRuntime(rt = ${rt}) does not support module loading`);
        return loadModule(rt, ctx, moduleName);
      } catch (error) {
        return console.error("[C to host module loader error: returning null]", error), 0;
      }
    }), normalizeModule: (asyncify, rt, ctx, moduleBaseName, moduleName) => this.handleAsyncify(asyncify, () => {
      try {
        let runtimeCallbacks = this.runtimeCallbacks.get(rt);
        if (!runtimeCallbacks)
          throw new Error(`QuickJSRuntime(rt = ${rt}) not found for C module loader`);
        let normalizeModule = runtimeCallbacks.normalizeModule;
        if (!normalizeModule)
          throw new Error(`QuickJSRuntime(rt = ${rt}) does not support module loading`);
        return normalizeModule(rt, ctx, moduleBaseName, moduleName);
      } catch (error) {
        return console.error("[C to host module loader error: returning null]", error), 0;
      }
    }) });
    this.module = module, this.module.callbacks = this.cToHostCallbacks;
  }
  setRuntimeCallbacks(rt, callbacks) {
    this.runtimeCallbacks.set(rt, callbacks);
  }
  deleteRuntime(rt) {
    this.runtimeCallbacks.delete(rt);
  }
  setContextCallbacks(ctx, callbacks) {
    this.contextCallbacks.set(ctx, callbacks);
  }
  deleteContext(ctx) {
    this.contextCallbacks.delete(ctx);
  }
  handleAsyncify(asyncify, fn) {
    if (asyncify)
      return asyncify.handleSleep((done) => {
        try {
          let result = fn();
          if (!(result instanceof Promise)) {
            debugLog("asyncify.handleSleep: not suspending:", result), done(result);
            return;
          }
          if (this.suspended)
            throw new QuickJSAsyncifyError(`Already suspended at: ${this.suspended.stack}
Attempted to suspend at:`);
          this.suspended = new QuickJSAsyncifySuspended(`(${this.suspendedCount++})`), debugLog("asyncify.handleSleep: suspending:", this.suspended), result.then((resolvedResult) => {
            this.suspended = undefined, debugLog("asyncify.handleSleep: resolved:", resolvedResult), done(resolvedResult);
          }, (error) => {
            debugLog("asyncify.handleSleep: rejected:", error), console.error("QuickJS: cannot handle error in suspended function", error), this.suspended = undefined;
          });
        } catch (error) {
          throw debugLog("asyncify.handleSleep: error:", error), this.suspended = undefined, error;
        }
      });
    let value = fn();
    if (value instanceof Promise)
      throw new Error("Promise return value not supported in non-asyncify context.");
    return value;
  }
}, QuickJSWASMModule = class {
  constructor(module, ffi) {
    this.module = module, this.ffi = ffi, this.callbacks = new QuickJSModuleCallbacks(module);
  }
  newRuntime(options = {}) {
    let rt = new Lifetime(this.ffi.QTS_NewRuntime(), undefined, (rt_ptr) => {
      this.ffi.QTS_FreeRuntime(rt_ptr), this.callbacks.deleteRuntime(rt_ptr);
    }), runtime = new QuickJSRuntime({ module: this.module, callbacks: this.callbacks, ffi: this.ffi, rt });
    return applyBaseRuntimeOptions(runtime, options), options.moduleLoader && runtime.setModuleLoader(options.moduleLoader), runtime;
  }
  newContext(options = {}) {
    let runtime = this.newRuntime(), context = runtime.newContext({ ...options, ownedLifetimes: concat(runtime, options.ownedLifetimes) });
    return runtime.context = context, context;
  }
  evalCode(code, options = {}) {
    return Scope.withScope((scope) => {
      let vm = scope.manage(this.newContext());
      applyModuleEvalRuntimeOptions(vm.runtime, options);
      let result = vm.evalCode(code, "eval.js");
      if (options.memoryLimitBytes !== undefined && vm.runtime.setMemoryLimit(-1), result.error)
        throw vm.dump(scope.manage(result.error));
      return vm.dump(scope.manage(result.value));
    });
  }
  getWasmMemory() {
    let memory = this.module.quickjsEmscriptenInit?.(() => {})?.getWasmMemory?.();
    if (!memory)
      throw new Error("Variant does not support getting WebAssembly.Memory");
    return memory;
  }
  getFFI() {
    return this.ffi;
  }
};
var init_chunk_V2S4ZYJR = __esm(() => {
  init_dist();
  init_dist();
  __defProp2 = Object.defineProperty;
  errors_exports = {};
  __export2(errors_exports, { QuickJSAsyncifyError: () => QuickJSAsyncifyError, QuickJSAsyncifySuspended: () => QuickJSAsyncifySuspended, QuickJSEmptyGetOwnPropertyNames: () => QuickJSEmptyGetOwnPropertyNames, QuickJSEmscriptenModuleError: () => QuickJSEmscriptenModuleError, QuickJSHostRefInvalid: () => QuickJSHostRefInvalid, QuickJSHostRefRangeExceeded: () => QuickJSHostRefRangeExceeded, QuickJSMemoryLeakDetected: () => QuickJSMemoryLeakDetected, QuickJSNotImplemented: () => QuickJSNotImplemented, QuickJSPromisePending: () => QuickJSPromisePending, QuickJSUnknownIntrinsic: () => QuickJSUnknownIntrinsic, QuickJSUnwrapError: () => QuickJSUnwrapError, QuickJSUseAfterFree: () => QuickJSUseAfterFree, QuickJSWrongOwner: () => QuickJSWrongOwner });
  QuickJSUnwrapError = class extends Error {
    constructor(cause, context) {
      let message = typeof cause == "object" && cause && "message" in cause ? String(cause.message) : String(cause);
      super(message);
      this.cause = cause;
      this.context = context;
      this.name = "QuickJSUnwrapError";
    }
  };
  QuickJSWrongOwner = class extends Error {
    constructor() {
      super(...arguments);
      this.name = "QuickJSWrongOwner";
    }
  };
  QuickJSUseAfterFree = class extends Error {
    constructor() {
      super(...arguments);
      this.name = "QuickJSUseAfterFree";
    }
  };
  QuickJSNotImplemented = class extends Error {
    constructor() {
      super(...arguments);
      this.name = "QuickJSNotImplemented";
    }
  };
  QuickJSAsyncifyError = class extends Error {
    constructor() {
      super(...arguments);
      this.name = "QuickJSAsyncifyError";
    }
  };
  QuickJSAsyncifySuspended = class extends Error {
    constructor() {
      super(...arguments);
      this.name = "QuickJSAsyncifySuspended";
    }
  };
  QuickJSMemoryLeakDetected = class extends Error {
    constructor() {
      super(...arguments);
      this.name = "QuickJSMemoryLeakDetected";
    }
  };
  QuickJSEmscriptenModuleError = class extends Error {
    constructor() {
      super(...arguments);
      this.name = "QuickJSEmscriptenModuleError";
    }
  };
  QuickJSUnknownIntrinsic = class extends TypeError {
    constructor() {
      super(...arguments);
      this.name = "QuickJSUnknownIntrinsic";
    }
  };
  QuickJSPromisePending = class extends Error {
    constructor() {
      super(...arguments);
      this.name = "QuickJSPromisePending";
    }
  };
  QuickJSEmptyGetOwnPropertyNames = class extends Error {
    constructor() {
      super(...arguments);
      this.name = "QuickJSEmptyGetOwnPropertyNames";
    }
  };
  QuickJSHostRefRangeExceeded = class extends Error {
    constructor() {
      super(...arguments);
      this.name = "QuickJSHostRefRangeExceeded";
    }
  };
  QuickJSHostRefInvalid = class extends Error {
    constructor() {
      super(...arguments);
      this.name = "QuickJSHostRefInvalid";
    }
  };
  AwaitYield = awaitYield;
  AwaitYield.of = awaitYieldOf;
  UsingDisposable = class {
    [Symbol.dispose]() {
      return this.dispose();
    }
  };
  SymbolDispose = Symbol.dispose ?? Symbol.for("Symbol.dispose");
  prototypeAsAny = UsingDisposable.prototype;
  prototypeAsAny[SymbolDispose] || (prototypeAsAny[SymbolDispose] = function() {
    return this.dispose();
  });
  Lifetime = class _Lifetime extends UsingDisposable {
    constructor(_value, copier, disposer, _owner) {
      super();
      this._value = _value;
      this.copier = copier;
      this.disposer = disposer;
      this._owner = _owner;
      this._alive = true;
      this._constructorStack = QTS_DEBUG ? new Error("Lifetime constructed").stack : undefined;
    }
    get alive() {
      return this._alive;
    }
    get value() {
      return this.assertAlive(), this._value;
    }
    get owner() {
      return this._owner;
    }
    get dupable() {
      return !!this.copier;
    }
    dup() {
      if (this.assertAlive(), !this.copier)
        throw new Error("Non-dupable lifetime");
      return new _Lifetime(this.copier(this._value), this.copier, this.disposer, this._owner);
    }
    consume(map) {
      this.assertAlive();
      let result = map(this);
      return this.dispose(), result;
    }
    map(map) {
      return this.assertAlive(), map(this);
    }
    tap(fn) {
      return fn(this), this;
    }
    dispose() {
      this.assertAlive(), this.disposer && this.disposer(this._value), this._alive = false;
    }
    assertAlive() {
      if (!this.alive)
        throw this._constructorStack ? new QuickJSUseAfterFree(`Lifetime not alive
${this._constructorStack}
Lifetime used`) : new QuickJSUseAfterFree("Lifetime not alive");
    }
  };
  StaticLifetime = class extends Lifetime {
    constructor(value, owner) {
      super(value, undefined, undefined, owner);
    }
    get dupable() {
      return true;
    }
    dup() {
      return this;
    }
    dispose() {}
  };
  WeakLifetime = class extends Lifetime {
    constructor(value, copier, disposer, owner) {
      super(value, copier, disposer, owner);
    }
    dispose() {
      this._alive = false;
    }
  };
  Scope = class _Scope extends UsingDisposable {
    constructor() {
      super(...arguments);
      this._disposables = new Lifetime(new Set);
      this.manage = (lifetime) => (this._disposables.value.add(lifetime), lifetime);
    }
    static withScope(block) {
      let scope = new _Scope, blockError;
      try {
        return block(scope);
      } catch (error) {
        throw blockError = error, error;
      } finally {
        scopeFinally(scope, blockError);
      }
    }
    static withScopeMaybeAsync(_this, block) {
      return maybeAsync(undefined, function* (awaited) {
        let scope = new _Scope, blockError;
        try {
          return yield* awaited.of(block.call(_this, awaited, scope));
        } catch (error) {
          throw blockError = error, error;
        } finally {
          scopeFinally(scope, blockError);
        }
      });
    }
    static async withScopeAsync(block) {
      let scope = new _Scope, blockError;
      try {
        return await block(scope);
      } catch (error) {
        throw blockError = error, error;
      } finally {
        scopeFinally(scope, blockError);
      }
    }
    get alive() {
      return this._disposables.alive;
    }
    dispose() {
      let lifetimes = Array.from(this._disposables.value.values()).reverse();
      for (let lifetime of lifetimes)
        lifetime.alive && lifetime.dispose();
      this._disposables.dispose();
    }
  };
  AbstractDisposableResult = class _AbstractDisposableResult extends UsingDisposable {
    static success(value) {
      return new DisposableSuccess(value);
    }
    static fail(error, onUnwrap) {
      return new DisposableFail(error, onUnwrap);
    }
    static is(result) {
      return result instanceof _AbstractDisposableResult;
    }
  };
  DisposableSuccess = class extends AbstractDisposableResult {
    constructor(value) {
      super();
      this.value = value;
    }
    get alive() {
      return isDisposable(this.value) ? this.value.alive : true;
    }
    dispose() {
      isDisposable(this.value) && this.value.dispose();
    }
    unwrap() {
      return this.value;
    }
    unwrapOr(_fallback) {
      return this.value;
    }
  };
  DisposableFail = class extends AbstractDisposableResult {
    constructor(error, onUnwrap) {
      super();
      this.error = error;
      this.onUnwrap = onUnwrap;
    }
    get alive() {
      return isDisposable(this.error) ? this.error.alive : true;
    }
    dispose() {
      isDisposable(this.error) && this.error.dispose();
    }
    unwrap() {
      throw this.onUnwrap(this), this.error;
    }
    unwrapOr(fallback) {
      return fallback;
    }
  };
  DisposableResult = AbstractDisposableResult;
  QuickJSDeferredPromise = class extends UsingDisposable {
    constructor(args) {
      super();
      this.resolve = (value) => {
        this.resolveHandle.alive && (this.context.unwrapResult(this.context.callFunction(this.resolveHandle, this.context.undefined, value || this.context.undefined)).dispose(), this.disposeResolvers(), this.onSettled());
      };
      this.reject = (value) => {
        this.rejectHandle.alive && (this.context.unwrapResult(this.context.callFunction(this.rejectHandle, this.context.undefined, value || this.context.undefined)).dispose(), this.disposeResolvers(), this.onSettled());
      };
      this.dispose = () => {
        this.handle.alive && this.handle.dispose(), this.disposeResolvers();
      };
      this.context = args.context, this.owner = args.context.runtime, this.handle = args.promiseHandle, this.settled = new Promise((resolve) => {
        this.onSettled = resolve;
      }), this.resolveHandle = args.resolveHandle, this.rejectHandle = args.rejectHandle;
    }
    get alive() {
      return this.handle.alive || this.resolveHandle.alive || this.rejectHandle.alive;
    }
    disposeResolvers() {
      this.resolveHandle.alive && this.resolveHandle.dispose(), this.rejectHandle.alive && this.rejectHandle.dispose();
    }
  };
  UnstableSymbol = Symbol("Unstable");
  DefaultIntrinsics = Object.freeze({ BaseObjects: true, Date: true, Eval: true, StringNormalize: true, RegExp: true, JSON: true, Proxy: true, MapSet: true, TypedArrays: true, Promise: true });
  QuickJSIterator = class extends UsingDisposable {
    constructor(handle, context) {
      super();
      this.handle = handle;
      this.context = context;
      this._isDone = false;
      this.owner = context.runtime;
    }
    [Symbol.iterator]() {
      return this;
    }
    next(value) {
      if (!this.alive || this._isDone)
        return { done: true, value: undefined };
      let nextMethod = this._next ?? (this._next = this.context.getProp(this.handle, "next"));
      return this.callIteratorMethod(nextMethod, value);
    }
    return(value) {
      if (!this.alive)
        return { done: true, value: undefined };
      let returnMethod = this.context.getProp(this.handle, "return");
      if (returnMethod === this.context.undefined && value === undefined)
        return this.dispose(), { done: true, value: undefined };
      let result = this.callIteratorMethod(returnMethod, value);
      return returnMethod.dispose(), this.dispose(), result;
    }
    throw(e) {
      if (!this.alive)
        return { done: true, value: undefined };
      let errorHandle = e instanceof Lifetime ? e : this.context.newError(e), throwMethod = this.context.getProp(this.handle, "throw"), result = this.callIteratorMethod(throwMethod, e);
      return errorHandle.alive && errorHandle.dispose(), throwMethod.dispose(), this.dispose(), result;
    }
    get alive() {
      return this.handle.alive;
    }
    dispose() {
      this._isDone = true, this.handle.dispose(), this._next?.dispose();
    }
    callIteratorMethod(method, input) {
      let callResult = input ? this.context.callFunction(method, this.handle, input) : this.context.callFunction(method, this.handle);
      if (callResult.error)
        return this.dispose(), { value: callResult };
      let done = this.context.getProp(callResult.value, "done").consume((v) => this.context.dump(v)), value = this.context.getProp(callResult.value, "value");
      return callResult.value.dispose(), done && this.dispose(), { value: DisposableResult.success(value), done };
    }
  };
  HostRef = class extends UsingDisposable {
    constructor(runtime, handle, id) {
      if (id === INVALID_HOST_REF_ID)
        throw new QuickJSHostRefInvalid("cannot create HostRef with undefined id");
      super();
      this.runtime = runtime;
      this.handle = handle;
      this.id = id;
    }
    get alive() {
      return this.handle.alive;
    }
    dispose() {
      this.handle.dispose();
    }
    get value() {
      return this.runtime.hostRefs.get(this.id);
    }
  };
  ContextMemory = class extends ModuleMemory {
    constructor(args) {
      super(args.module);
      this.scope = new Scope;
      this.copyJSValue = (ptr) => this.ffi.QTS_DupValuePointer(this.ctx.value, ptr);
      this.freeJSValue = (ptr) => {
        this.ffi.QTS_FreeValuePointer(this.ctx.value, ptr);
      };
      args.ownedLifetimes?.forEach((lifetime) => this.scope.manage(lifetime)), this.owner = args.owner, this.module = args.module, this.ffi = args.ffi, this.rt = args.rt, this.ctx = this.scope.manage(args.ctx);
    }
    get alive() {
      return this.scope.alive;
    }
    dispose() {
      return this.scope.dispose();
    }
    [Symbol.dispose]() {
      return this.dispose();
    }
    manage(lifetime) {
      return this.scope.manage(lifetime);
    }
    consumeJSCharPointer(ptr) {
      let str = this.module.UTF8ToString(ptr);
      return this.ffi.QTS_FreeCString(this.ctx.value, ptr), str;
    }
    heapValueHandle(ptr, extraDispose) {
      let dispose = extraDispose ? (val) => {
        extraDispose(), this.freeJSValue(val);
      } : this.freeJSValue;
      return new Lifetime(ptr, this.copyJSValue, dispose, this.owner);
    }
    staticHeapValueHandle(ptr) {
      return this.manage(this.heapValueHandle(ptr)), new StaticLifetime(ptr, this.owner);
    }
  };
  QuickJSContext = class extends UsingDisposable {
    constructor(args) {
      super();
      this._undefined = undefined;
      this._null = undefined;
      this._false = undefined;
      this._true = undefined;
      this._global = undefined;
      this._BigInt = undefined;
      this._Symbol = undefined;
      this._SymbolIterator = undefined;
      this._SymbolAsyncIterator = undefined;
      this.cToHostCallbacks = { callFunction: (ctx, this_ptr, argc, argv, fn_id) => {
        if (ctx !== this.ctx.value)
          throw new Error("QuickJSContext instance received C -> JS call with mismatched ctx");
        let fn = this.getFunction(fn_id);
        return Scope.withScopeMaybeAsync(this, function* (awaited, scope) {
          let thisHandle = scope.manage(new WeakLifetime(this_ptr, this.memory.copyJSValue, this.memory.freeJSValue, this.runtime)), argHandles = new Array(argc);
          for (let i = 0;i < argc; i++) {
            let ptr = this.ffi.QTS_ArgvGetJSValueConstPointer(argv, i);
            argHandles[i] = scope.manage(new WeakLifetime(ptr, this.memory.copyJSValue, this.memory.freeJSValue, this.runtime));
          }
          try {
            let result = yield* awaited(fn.apply(thisHandle, argHandles));
            if (result) {
              if ("error" in result && result.error)
                throw this.runtime.debugLog("throw error", result.error), result.error;
              let handle = scope.manage(result instanceof Lifetime ? result : result.value);
              return this.ffi.QTS_DupValuePointer(this.ctx.value, handle.value);
            }
            return 0;
          } catch (error) {
            return this.errorToHandle(error).consume((errorHandle) => this.ffi.QTS_Throw(this.ctx.value, errorHandle.value));
          }
        });
      } };
      this.runtime = args.runtime, this.module = args.module, this.ffi = args.ffi, this.rt = args.rt, this.ctx = args.ctx, this.memory = new ContextMemory({ ...args, owner: this.runtime }), args.callbacks.setContextCallbacks(this.ctx.value, this.cToHostCallbacks), this.dump = this.dump.bind(this), this.getString = this.getString.bind(this), this.getNumber = this.getNumber.bind(this), this.resolvePromise = this.resolvePromise.bind(this), this.uint32Out = this.memory.manage(this.memory.newTypedArray(Uint32Array, 1));
    }
    get alive() {
      return this.memory.alive;
    }
    dispose() {
      this.memory.dispose();
    }
    get undefined() {
      if (this._undefined)
        return this._undefined;
      let ptr = this.ffi.QTS_GetUndefined();
      return this._undefined = new StaticLifetime(ptr);
    }
    get null() {
      if (this._null)
        return this._null;
      let ptr = this.ffi.QTS_GetNull();
      return this._null = new StaticLifetime(ptr);
    }
    get true() {
      if (this._true)
        return this._true;
      let ptr = this.ffi.QTS_GetTrue();
      return this._true = new StaticLifetime(ptr);
    }
    get false() {
      if (this._false)
        return this._false;
      let ptr = this.ffi.QTS_GetFalse();
      return this._false = new StaticLifetime(ptr);
    }
    get global() {
      if (this._global)
        return this._global;
      let ptr = this.ffi.QTS_GetGlobalObject(this.ctx.value);
      return this._global = this.memory.staticHeapValueHandle(ptr), this._global;
    }
    newNumber(num) {
      return this.memory.heapValueHandle(this.ffi.QTS_NewFloat64(this.ctx.value, num));
    }
    newString(str) {
      let ptr = this.memory.newHeapCharPointer(str).consume((charHandle) => this.ffi.QTS_NewString(this.ctx.value, charHandle.value.ptr));
      return this.memory.heapValueHandle(ptr);
    }
    newUniqueSymbol(description) {
      let key = (typeof description == "symbol" ? description.description : description) ?? "", ptr = this.memory.newHeapCharPointer(key).consume((charHandle) => this.ffi.QTS_NewSymbol(this.ctx.value, charHandle.value.ptr, 0));
      return this.memory.heapValueHandle(ptr);
    }
    newSymbolFor(key) {
      let description = (typeof key == "symbol" ? key.description : key) ?? "", ptr = this.memory.newHeapCharPointer(description).consume((charHandle) => this.ffi.QTS_NewSymbol(this.ctx.value, charHandle.value.ptr, 1));
      return this.memory.heapValueHandle(ptr);
    }
    getWellKnownSymbol(name) {
      return this._Symbol ?? (this._Symbol = this.memory.manage(this.getProp(this.global, "Symbol"))), this.getProp(this._Symbol, name);
    }
    newBigInt(num) {
      if (!this._BigInt) {
        let bigIntHandle2 = this.getProp(this.global, "BigInt");
        this.memory.manage(bigIntHandle2), this._BigInt = new StaticLifetime(bigIntHandle2.value, this.runtime);
      }
      let bigIntHandle = this._BigInt, asString = String(num);
      return this.newString(asString).consume((handle) => this.unwrapResult(this.callFunction(bigIntHandle, this.undefined, handle)));
    }
    newObject(prototype) {
      prototype && this.runtime.assertOwned(prototype);
      let ptr = prototype ? this.ffi.QTS_NewObjectProto(this.ctx.value, prototype.value) : this.ffi.QTS_NewObject(this.ctx.value);
      return this.memory.heapValueHandle(ptr);
    }
    newArray() {
      let ptr = this.ffi.QTS_NewArray(this.ctx.value);
      return this.memory.heapValueHandle(ptr);
    }
    newArrayBuffer(buffer) {
      let array = new Uint8Array(buffer), handle = this.memory.newHeapBufferPointer(array), ptr = this.ffi.QTS_NewArrayBuffer(this.ctx.value, handle.value.pointer, array.length);
      return this.memory.heapValueHandle(ptr);
    }
    newPromise(value) {
      let deferredPromise = Scope.withScope((scope) => {
        let mutablePointerArray = scope.manage(this.memory.newMutablePointerArray(2)), promisePtr = this.ffi.QTS_NewPromiseCapability(this.ctx.value, mutablePointerArray.value.ptr), promiseHandle = this.memory.heapValueHandle(promisePtr), [resolveHandle, rejectHandle] = Array.from(mutablePointerArray.value.typedArray).map((jsvaluePtr) => this.memory.heapValueHandle(jsvaluePtr));
        return new QuickJSDeferredPromise({ context: this, promiseHandle, resolveHandle, rejectHandle });
      });
      return value && typeof value == "function" && (value = new Promise(value)), value && Promise.resolve(value).then(deferredPromise.resolve, (error) => error instanceof Lifetime ? deferredPromise.reject(error) : this.newError(error).consume(deferredPromise.reject)), deferredPromise;
    }
    newFunction(nameOrFn, maybeFn) {
      let fn = typeof nameOrFn == "function" ? nameOrFn : maybeFn;
      if (!fn)
        throw new TypeError("Expected a function");
      return this.newFunctionWithOptions({ name: typeof nameOrFn == "string" ? nameOrFn : undefined, length: fn.length, isConstructor: false, fn });
    }
    newConstructorFunction(nameOrFn, maybeFn) {
      let fn = typeof nameOrFn == "function" ? nameOrFn : maybeFn;
      if (!fn)
        throw new TypeError("Expected a function");
      return this.newFunctionWithOptions({ name: typeof nameOrFn == "string" ? nameOrFn : undefined, length: fn.length, isConstructor: true, fn });
    }
    newFunctionWithOptions(args) {
      let { name, length, isConstructor, fn } = args, refId = this.runtime.hostRefs.put(fn);
      try {
        return this.memory.heapValueHandle(this.ffi.QTS_NewFunction(this.ctx.value, name ?? "", length, isConstructor, refId));
      } catch (error) {
        throw this.runtime.hostRefs.delete(refId), error;
      }
    }
    newError(error) {
      let errorHandle = this.memory.heapValueHandle(this.ffi.QTS_NewError(this.ctx.value));
      return error && typeof error == "object" ? (error.name !== undefined && this.newString(error.name).consume((handle) => this.setProp(errorHandle, "name", handle)), error.message !== undefined && this.newString(error.message).consume((handle) => this.setProp(errorHandle, "message", handle))) : typeof error == "string" ? this.newString(error).consume((handle) => this.setProp(errorHandle, "message", handle)) : error !== undefined && this.newString(String(error)).consume((handle) => this.setProp(errorHandle, "message", handle)), errorHandle;
    }
    newHostRef(value) {
      let id = this.runtime.hostRefs.put(value);
      try {
        let handle = this.memory.heapValueHandle(this.ffi.QTS_NewHostRef(this.ctx.value, id));
        return new HostRef(this.runtime, handle, id);
      } catch (error) {
        throw this.runtime.hostRefs.delete(id), error;
      }
    }
    toHostRef(handle) {
      let id = this.ffi.QTS_GetHostRefId(handle.value);
      if (id !== 0)
        return this.runtime.hostRefs.get(id), new HostRef(this.runtime, handle.dup(), id);
    }
    unwrapHostRef(handle) {
      let id = this.ffi.QTS_GetHostRefId(handle.value);
      if (id === 0)
        throw new QuickJSHostRefInvalid("handle is not a HostRef");
      return this.runtime.hostRefs.get(id);
    }
    typeof(handle) {
      return this.runtime.assertOwned(handle), this.memory.consumeHeapCharPointer(this.ffi.QTS_Typeof(this.ctx.value, handle.value));
    }
    getNumber(handle) {
      return this.runtime.assertOwned(handle), this.ffi.QTS_GetFloat64(this.ctx.value, handle.value);
    }
    getString(handle) {
      return this.runtime.assertOwned(handle), this.memory.consumeJSCharPointer(this.ffi.QTS_GetString(this.ctx.value, handle.value));
    }
    getSymbol(handle) {
      this.runtime.assertOwned(handle);
      let key = this.memory.consumeJSCharPointer(this.ffi.QTS_GetSymbolDescriptionOrKey(this.ctx.value, handle.value));
      return this.ffi.QTS_IsGlobalSymbol(this.ctx.value, handle.value) ? Symbol.for(key) : Symbol(key);
    }
    getBigInt(handle) {
      this.runtime.assertOwned(handle);
      let asString = this.getString(handle);
      return BigInt(asString);
    }
    getArrayBuffer(handle) {
      this.runtime.assertOwned(handle);
      let len = this.ffi.QTS_GetArrayBufferLength(this.ctx.value, handle.value), ptr = this.ffi.QTS_GetArrayBuffer(this.ctx.value, handle.value);
      if (!ptr)
        throw new Error("Couldn't allocate memory to get ArrayBuffer");
      return new Lifetime(this.module.HEAPU8.subarray(ptr, ptr + len), undefined, () => this.module._free(ptr));
    }
    getPromiseState(handle) {
      this.runtime.assertOwned(handle);
      let state = this.ffi.QTS_PromiseState(this.ctx.value, handle.value);
      if (state < 0)
        return { type: "fulfilled", value: handle, notAPromise: true };
      if (state === JSPromiseStateEnum.Pending)
        return { type: "pending", get error() {
          return new QuickJSPromisePending("Cannot unwrap a pending promise");
        } };
      let ptr = this.ffi.QTS_PromiseResult(this.ctx.value, handle.value), result = this.memory.heapValueHandle(ptr);
      if (state === JSPromiseStateEnum.Fulfilled)
        return { type: "fulfilled", value: result };
      if (state === JSPromiseStateEnum.Rejected)
        return { type: "rejected", error: result };
      throw result.dispose(), new Error(`Unknown JSPromiseStateEnum: ${state}`);
    }
    resolvePromise(promiseLikeHandle) {
      this.runtime.assertOwned(promiseLikeHandle);
      let vmResolveResult = Scope.withScope((scope) => {
        let vmPromise = scope.manage(this.getProp(this.global, "Promise")), vmPromiseResolve = scope.manage(this.getProp(vmPromise, "resolve"));
        return this.callFunction(vmPromiseResolve, vmPromise, promiseLikeHandle);
      });
      return vmResolveResult.error ? Promise.resolve(vmResolveResult) : new Promise((resolve) => {
        Scope.withScope((scope) => {
          let resolveHandle = scope.manage(this.newFunction("resolve", (value) => {
            resolve(this.success(value && value.dup()));
          })), rejectHandle = scope.manage(this.newFunction("reject", (error) => {
            resolve(this.fail(error && error.dup()));
          })), promiseHandle = scope.manage(vmResolveResult.value), promiseThenHandle = scope.manage(this.getProp(promiseHandle, "then"));
          this.callFunction(promiseThenHandle, promiseHandle, resolveHandle, rejectHandle).unwrap().dispose();
        });
      });
    }
    isEqual(a, b, equalityType = IsEqualOp.IsStrictlyEqual) {
      if (a === b)
        return true;
      this.runtime.assertOwned(a), this.runtime.assertOwned(b);
      let result = this.ffi.QTS_IsEqual(this.ctx.value, a.value, b.value, equalityType);
      if (result === -1)
        throw new QuickJSNotImplemented("WASM variant does not expose equality");
      return !!result;
    }
    eq(handle, other) {
      return this.isEqual(handle, other, IsEqualOp.IsStrictlyEqual);
    }
    sameValue(handle, other) {
      return this.isEqual(handle, other, IsEqualOp.IsSameValue);
    }
    sameValueZero(handle, other) {
      return this.isEqual(handle, other, IsEqualOp.IsSameValueZero);
    }
    getProp(handle, key) {
      this.runtime.assertOwned(handle);
      let ptr;
      return typeof key == "number" && key >= 0 ? ptr = this.ffi.QTS_GetPropNumber(this.ctx.value, handle.value, key) : ptr = this.borrowPropertyKey(key).consume((quickJSKey) => this.ffi.QTS_GetProp(this.ctx.value, handle.value, quickJSKey.value)), this.memory.heapValueHandle(ptr);
    }
    getLength(handle) {
      if (this.runtime.assertOwned(handle), !(this.ffi.QTS_GetLength(this.ctx.value, this.uint32Out.value.ptr, handle.value) < 0))
        return this.uint32Out.value.typedArray[0];
    }
    getOwnPropertyNames(handle, options = { strings: true, numbersAsStrings: true }) {
      this.runtime.assertOwned(handle), handle.value;
      let flags = getOwnPropertyNamesOptionsToFlags(options);
      if (flags === 0)
        throw new QuickJSEmptyGetOwnPropertyNames("No options set, will return an empty array");
      return Scope.withScope((scope) => {
        let outPtr = scope.manage(this.memory.newMutablePointerArray(1)), errorPtr = this.ffi.QTS_GetOwnPropertyNames(this.ctx.value, outPtr.value.ptr, this.uint32Out.value.ptr, handle.value, flags);
        if (errorPtr)
          return this.fail(this.memory.heapValueHandle(errorPtr));
        let len = this.uint32Out.value.typedArray[0], ptr = outPtr.value.typedArray[0], pointerArray = new Uint32Array(this.module.HEAP8.buffer, ptr, len), handles = Array.from(pointerArray).map((ptr2) => this.memory.heapValueHandle(ptr2));
        return this.ffi.QTS_FreeVoidPointer(this.ctx.value, ptr), this.success(createDisposableArray(handles));
      });
    }
    getIterator(iterableHandle) {
      let SymbolIterator = this._SymbolIterator ?? (this._SymbolIterator = this.memory.manage(this.getWellKnownSymbol("iterator")));
      return Scope.withScope((scope) => {
        let methodHandle = scope.manage(this.getProp(iterableHandle, SymbolIterator)), iteratorCallResult = this.callFunction(methodHandle, iterableHandle);
        return iteratorCallResult.error ? iteratorCallResult : this.success(new QuickJSIterator(iteratorCallResult.value, this));
      });
    }
    setProp(handle, key, value) {
      this.runtime.assertOwned(handle), this.borrowPropertyKey(key).consume((quickJSKey) => this.ffi.QTS_SetProp(this.ctx.value, handle.value, quickJSKey.value, value.value));
    }
    defineProp(handle, key, descriptor) {
      this.runtime.assertOwned(handle), Scope.withScope((scope) => {
        let quickJSKey = scope.manage(this.borrowPropertyKey(key)), value = descriptor.value || this.undefined, configurable = !!descriptor.configurable, enumerable = !!descriptor.enumerable, hasValue = !!descriptor.value, get = descriptor.get ? scope.manage(this.newFunction(descriptor.get.name, descriptor.get)) : this.undefined, set = descriptor.set ? scope.manage(this.newFunction(descriptor.set.name, descriptor.set)) : this.undefined;
        this.ffi.QTS_DefineProp(this.ctx.value, handle.value, quickJSKey.value, value.value, get.value, set.value, configurable, enumerable, hasValue);
      });
    }
    callFunction(func, thisVal, ...restArgs) {
      this.runtime.assertOwned(func);
      let args, firstArg = restArgs[0];
      firstArg === undefined || Array.isArray(firstArg) ? args = firstArg ?? [] : args = restArgs;
      let resultPtr = this.memory.toPointerArray(args).consume((argsArrayPtr) => this.ffi.QTS_Call(this.ctx.value, func.value, thisVal.value, args.length, argsArrayPtr.value)), errorPtr = this.ffi.QTS_ResolveException(this.ctx.value, resultPtr);
      return errorPtr ? (this.ffi.QTS_FreeValuePointer(this.ctx.value, resultPtr), this.fail(this.memory.heapValueHandle(errorPtr))) : this.success(this.memory.heapValueHandle(resultPtr));
    }
    callMethod(thisHandle, key, args = []) {
      return this.getProp(thisHandle, key).consume((func) => this.callFunction(func, thisHandle, args));
    }
    evalCode(code, filename = "eval.js", options) {
      let detectModule = options === undefined ? 1 : 0, flags = evalOptionsToFlags(options), resultPtr = this.memory.newHeapCharPointer(code).consume((charHandle) => this.ffi.QTS_Eval(this.ctx.value, charHandle.value.ptr, charHandle.value.strlen, filename, detectModule, flags)), errorPtr = this.ffi.QTS_ResolveException(this.ctx.value, resultPtr);
      return errorPtr ? (this.ffi.QTS_FreeValuePointer(this.ctx.value, resultPtr), this.fail(this.memory.heapValueHandle(errorPtr))) : this.success(this.memory.heapValueHandle(resultPtr));
    }
    throw(error) {
      return this.errorToHandle(error).consume((handle) => this.ffi.QTS_Throw(this.ctx.value, handle.value));
    }
    borrowPropertyKey(key) {
      return typeof key == "number" ? this.newNumber(key) : typeof key == "string" ? this.newString(key) : new StaticLifetime(key.value, this.runtime);
    }
    getMemory(rt) {
      if (rt === this.rt.value)
        return this.memory;
      throw new Error("Private API. Cannot get memory from a different runtime");
    }
    dump(handle) {
      this.runtime.assertOwned(handle);
      let type = this.typeof(handle);
      if (type === "string")
        return this.getString(handle);
      if (type === "number")
        return this.getNumber(handle);
      if (type === "bigint")
        return this.getBigInt(handle);
      if (type === "undefined")
        return;
      if (type === "symbol")
        return this.getSymbol(handle);
      let asPromiseState = this.getPromiseState(handle);
      if (asPromiseState.type === "fulfilled" && !asPromiseState.notAPromise)
        return handle.dispose(), { type: asPromiseState.type, value: asPromiseState.value.consume(this.dump) };
      if (asPromiseState.type === "pending")
        return handle.dispose(), { type: asPromiseState.type };
      if (asPromiseState.type === "rejected")
        return handle.dispose(), { type: asPromiseState.type, error: asPromiseState.error.consume(this.dump) };
      let str = this.memory.consumeJSCharPointer(this.ffi.QTS_Dump(this.ctx.value, handle.value));
      try {
        return JSON.parse(str);
      } catch {
        return str;
      }
    }
    unwrapResult(result) {
      if (result.error) {
        let context = "context" in result.error ? result.error.context : this, cause = result.error.consume((error) => this.dump(error));
        if (cause && typeof cause == "object" && typeof cause.message == "string") {
          let { message, name, stack, ...rest } = cause, exception = new QuickJSUnwrapError(cause, context);
          typeof name == "string" && (exception.name = cause.name), exception.message = message;
          let hostStack = exception.stack;
          throw typeof stack == "string" && (exception.stack = `${name}: ${message}
${cause.stack}Host: ${hostStack}`), Object.assign(exception, rest), exception;
        }
        throw new QuickJSUnwrapError(cause);
      }
      return result.value;
    }
    [Symbol.for("nodejs.util.inspect.custom")]() {
      return this.alive ? `${this.constructor.name} { ctx: ${this.ctx.value} rt: ${this.rt.value} }` : `${this.constructor.name} { disposed }`;
    }
    getFunction(fn_id) {
      let fn = this.runtime.hostRefs.get(fn_id);
      if (typeof fn != "function")
        throw new Error(`Host reference ${fn_id} is not a function`);
      return fn;
    }
    errorToHandle(error) {
      return error instanceof Lifetime ? error : this.newError(error);
    }
    encodeBinaryJSON(handle) {
      let ptr = this.ffi.QTS_bjson_encode(this.ctx.value, handle.value);
      return this.memory.heapValueHandle(ptr);
    }
    decodeBinaryJSON(handle) {
      let ptr = this.ffi.QTS_bjson_decode(this.ctx.value, handle.value);
      return this.memory.heapValueHandle(ptr);
    }
    success(value) {
      return DisposableResult.success(value);
    }
    fail(error) {
      return DisposableResult.fail(error, (error2) => this.unwrapResult(error2));
    }
  };
  QuickJSRuntime = class extends UsingDisposable {
    constructor(args) {
      super();
      this.scope = new Scope;
      this.contextMap = new Map;
      this.hostRefs = new HostRefMap;
      this._debugMode = false;
      this.cToHostCallbacks = { freeHostRef: (rt, host_ref_id) => {
        if (rt !== this.rt.value)
          throw new Error("Runtime pointer mismatch");
        this.hostRefs.delete(host_ref_id);
      }, shouldInterrupt: (rt) => {
        if (rt !== this.rt.value)
          throw new Error("QuickJSContext instance received C -> JS interrupt with mismatched rt");
        let fn = this.interruptHandler;
        if (!fn)
          throw new Error("QuickJSContext had no interrupt handler");
        return fn(this) ? 1 : 0;
      }, loadModuleSource: maybeAsyncFn(this, function* (awaited, rt, ctx, moduleName) {
        let moduleLoader = this.moduleLoader;
        if (!moduleLoader)
          throw new Error("Runtime has no module loader");
        if (rt !== this.rt.value)
          throw new Error("Runtime pointer mismatch");
        let context = this.contextMap.get(ctx) ?? this.newContext({ contextPointer: ctx });
        try {
          let result = yield* awaited(moduleLoader(moduleName, context));
          if (typeof result == "object" && "error" in result && result.error)
            throw this.debugLog("cToHostLoadModule: loader returned error", result.error), result.error;
          let moduleSource = typeof result == "string" ? result : ("value" in result) ? result.value : result;
          return this.memory.newHeapCharPointer(moduleSource).value.ptr;
        } catch (error) {
          return this.debugLog("cToHostLoadModule: caught error", error), context.throw(error), 0;
        }
      }), normalizeModule: maybeAsyncFn(this, function* (awaited, rt, ctx, baseModuleName, moduleNameRequest) {
        let moduleNormalizer = this.moduleNormalizer;
        if (!moduleNormalizer)
          throw new Error("Runtime has no module normalizer");
        if (rt !== this.rt.value)
          throw new Error("Runtime pointer mismatch");
        let context = this.contextMap.get(ctx) ?? this.newContext({ contextPointer: ctx });
        try {
          let result = yield* awaited(moduleNormalizer(baseModuleName, moduleNameRequest, context));
          if (typeof result == "object" && "error" in result && result.error)
            throw this.debugLog("cToHostNormalizeModule: normalizer returned error", result.error), result.error;
          let name = typeof result == "string" ? result : result.value;
          return context.getMemory(this.rt.value).newHeapCharPointer(name).value.ptr;
        } catch (error) {
          return this.debugLog("normalizeModule: caught error", error), context.throw(error), 0;
        }
      }) };
      args.ownedLifetimes?.forEach((lifetime) => this.scope.manage(lifetime)), this.module = args.module, this.memory = new ModuleMemory(this.module), this.ffi = args.ffi, this.rt = args.rt, this.callbacks = args.callbacks, this.scope.manage(this.rt), this.callbacks.setRuntimeCallbacks(this.rt.value, this.cToHostCallbacks), this.executePendingJobs = this.executePendingJobs.bind(this), QTS_DEBUG && this.setDebugMode(true);
    }
    get alive() {
      return this.scope.alive;
    }
    dispose() {
      return this.scope.dispose();
    }
    newContext(options = {}) {
      let intrinsics = intrinsicsToFlags(options.intrinsics), ctx = new Lifetime(options.contextPointer || this.ffi.QTS_NewContext(this.rt.value, intrinsics), undefined, (ctx_ptr) => {
        this.contextMap.delete(ctx_ptr), this.callbacks.deleteContext(ctx_ptr), this.ffi.QTS_FreeContext(ctx_ptr);
      }), context = new QuickJSContext({ module: this.module, ctx, ffi: this.ffi, rt: this.rt, ownedLifetimes: options.ownedLifetimes, runtime: this, callbacks: this.callbacks });
      return this.contextMap.set(ctx.value, context), context;
    }
    setModuleLoader(moduleLoader, moduleNormalizer) {
      this.moduleLoader = moduleLoader, this.moduleNormalizer = moduleNormalizer, this.ffi.QTS_RuntimeEnableModuleLoader(this.rt.value, this.moduleNormalizer ? 1 : 0);
    }
    removeModuleLoader() {
      this.moduleLoader = undefined, this.ffi.QTS_RuntimeDisableModuleLoader(this.rt.value);
    }
    hasPendingJob() {
      return !!this.ffi.QTS_IsJobPending(this.rt.value);
    }
    setInterruptHandler(cb) {
      let prevInterruptHandler = this.interruptHandler;
      this.interruptHandler = cb, prevInterruptHandler || this.ffi.QTS_RuntimeEnableInterruptHandler(this.rt.value);
    }
    removeInterruptHandler() {
      this.interruptHandler && (this.ffi.QTS_RuntimeDisableInterruptHandler(this.rt.value), this.interruptHandler = undefined);
    }
    executePendingJobs(maxJobsToExecute = -1) {
      let ctxPtrOut = this.memory.newMutablePointerArray(1), valuePtr = this.ffi.QTS_ExecutePendingJob(this.rt.value, maxJobsToExecute ?? -1, ctxPtrOut.value.ptr), ctxPtr = ctxPtrOut.value.typedArray[0];
      if (ctxPtrOut.dispose(), ctxPtr === 0)
        return this.ffi.QTS_FreeValuePointerRuntime(this.rt.value, valuePtr), DisposableResult.success(0);
      let context = this.contextMap.get(ctxPtr) ?? this.newContext({ contextPointer: ctxPtr }), resultValue = context.getMemory(this.rt.value).heapValueHandle(valuePtr);
      if (context.typeof(resultValue) === "number") {
        let executedJobs = context.getNumber(resultValue);
        return resultValue.dispose(), DisposableResult.success(executedJobs);
      } else {
        let error = Object.assign(resultValue, { context });
        return DisposableResult.fail(error, (error2) => context.unwrapResult(error2));
      }
    }
    setMemoryLimit(limitBytes) {
      if (limitBytes < 0 && limitBytes !== -1)
        throw new Error("Cannot set memory limit to negative number. To unset, pass -1");
      this.ffi.QTS_RuntimeSetMemoryLimit(this.rt.value, limitBytes);
    }
    computeMemoryUsage() {
      let serviceContextMemory = this.getSystemContext().getMemory(this.rt.value);
      return serviceContextMemory.heapValueHandle(this.ffi.QTS_RuntimeComputeMemoryUsage(this.rt.value, serviceContextMemory.ctx.value));
    }
    dumpMemoryUsage() {
      return this.memory.consumeHeapCharPointer(this.ffi.QTS_RuntimeDumpMemoryUsage(this.rt.value));
    }
    setMaxStackSize(stackSize) {
      if (stackSize < 0)
        throw new Error("Cannot set memory limit to negative number. To unset, pass 0.");
      this.ffi.QTS_RuntimeSetMaxStackSize(this.rt.value, stackSize);
    }
    assertOwned(handle) {
      if (handle.owner && handle.owner.rt !== this.rt)
        throw new QuickJSWrongOwner(`Handle is not owned by this runtime: ${handle.owner.rt.value} != ${this.rt.value}`);
    }
    setDebugMode(enabled) {
      this._debugMode = enabled, this.ffi.DEBUG && this.rt.alive && this.ffi.QTS_SetDebugLogEnabled(this.rt.value, enabled ? 1 : 0);
    }
    isDebugMode() {
      return this._debugMode;
    }
    debugLog(...msg) {
      this._debugMode && console.log("quickjs-emscripten:", ...msg);
    }
    [Symbol.for("nodejs.util.inspect.custom")]() {
      return this.alive ? `${this.constructor.name} { rt: ${this.rt.value} }` : `${this.constructor.name} { disposed }`;
    }
    getSystemContext() {
      return this.context || (this.context = this.scope.manage(this.newContext())), this.context;
    }
  };
});

// node_modules/.bun/quickjs-emscripten-core@0.32.0/node_modules/quickjs-emscripten-core/dist/module-ES6BEMUI.mjs
var exports_module_ES6BEMUI = {};
__export(exports_module_ES6BEMUI, {
  applyModuleEvalRuntimeOptions: () => applyModuleEvalRuntimeOptions,
  applyBaseRuntimeOptions: () => applyBaseRuntimeOptions,
  QuickJSWASMModule: () => QuickJSWASMModule,
  QuickJSModuleCallbacks: () => QuickJSModuleCallbacks
});
var init_module_ES6BEMUI = __esm(() => {
  init_chunk_V2S4ZYJR();
});

// node_modules/.bun/@jitl+quickjs-wasmfile-release-sync@0.32.0/node_modules/@jitl/quickjs-wasmfile-release-sync/dist/ffi.mjs
var exports_ffi = {};
__export(exports_ffi, {
  QuickJSFFI: () => QuickJSFFI
});
var QuickJSFFI = class {
  constructor(module) {
    this.module = module;
    this.DEBUG = false;
    this.QTS_Throw = this.module.cwrap("QTS_Throw", "number", ["number", "number"]);
    this.QTS_NewError = this.module.cwrap("QTS_NewError", "number", ["number"]);
    this.QTS_RuntimeSetMemoryLimit = this.module.cwrap("QTS_RuntimeSetMemoryLimit", null, ["number", "number"]);
    this.QTS_RuntimeComputeMemoryUsage = this.module.cwrap("QTS_RuntimeComputeMemoryUsage", "number", ["number", "number"]);
    this.QTS_RuntimeDumpMemoryUsage = this.module.cwrap("QTS_RuntimeDumpMemoryUsage", "number", ["number"]);
    this.QTS_RecoverableLeakCheck = this.module.cwrap("QTS_RecoverableLeakCheck", "number", []);
    this.QTS_BuildIsSanitizeLeak = this.module.cwrap("QTS_BuildIsSanitizeLeak", "number", []);
    this.QTS_RuntimeSetMaxStackSize = this.module.cwrap("QTS_RuntimeSetMaxStackSize", null, ["number", "number"]);
    this.QTS_GetUndefined = this.module.cwrap("QTS_GetUndefined", "number", []);
    this.QTS_GetNull = this.module.cwrap("QTS_GetNull", "number", []);
    this.QTS_GetFalse = this.module.cwrap("QTS_GetFalse", "number", []);
    this.QTS_GetTrue = this.module.cwrap("QTS_GetTrue", "number", []);
    this.QTS_NewHostRef = this.module.cwrap("QTS_NewHostRef", "number", ["number", "number"]);
    this.QTS_GetHostRefId = this.module.cwrap("QTS_GetHostRefId", "number", ["number"]);
    this.QTS_NewRuntime = this.module.cwrap("QTS_NewRuntime", "number", []);
    this.QTS_FreeRuntime = this.module.cwrap("QTS_FreeRuntime", null, ["number"]);
    this.QTS_NewContext = this.module.cwrap("QTS_NewContext", "number", ["number", "number"]);
    this.QTS_FreeContext = this.module.cwrap("QTS_FreeContext", null, ["number"]);
    this.QTS_FreeValuePointer = this.module.cwrap("QTS_FreeValuePointer", null, ["number", "number"]);
    this.QTS_FreeValuePointerRuntime = this.module.cwrap("QTS_FreeValuePointerRuntime", null, ["number", "number"]);
    this.QTS_FreeVoidPointer = this.module.cwrap("QTS_FreeVoidPointer", null, ["number", "number"]);
    this.QTS_FreeCString = this.module.cwrap("QTS_FreeCString", null, ["number", "number"]);
    this.QTS_DupValuePointer = this.module.cwrap("QTS_DupValuePointer", "number", ["number", "number"]);
    this.QTS_NewObject = this.module.cwrap("QTS_NewObject", "number", ["number"]);
    this.QTS_NewObjectProto = this.module.cwrap("QTS_NewObjectProto", "number", ["number", "number"]);
    this.QTS_NewArray = this.module.cwrap("QTS_NewArray", "number", ["number"]);
    this.QTS_NewArrayBuffer = this.module.cwrap("QTS_NewArrayBuffer", "number", ["number", "number", "number"]);
    this.QTS_NewFloat64 = this.module.cwrap("QTS_NewFloat64", "number", ["number", "number"]);
    this.QTS_GetFloat64 = this.module.cwrap("QTS_GetFloat64", "number", ["number", "number"]);
    this.QTS_NewString = this.module.cwrap("QTS_NewString", "number", ["number", "number"]);
    this.QTS_GetString = this.module.cwrap("QTS_GetString", "number", ["number", "number"]);
    this.QTS_GetArrayBuffer = this.module.cwrap("QTS_GetArrayBuffer", "number", ["number", "number"]);
    this.QTS_GetArrayBufferLength = this.module.cwrap("QTS_GetArrayBufferLength", "number", ["number", "number"]);
    this.QTS_NewSymbol = this.module.cwrap("QTS_NewSymbol", "number", ["number", "number", "number"]);
    this.QTS_GetSymbolDescriptionOrKey = this.module.cwrap("QTS_GetSymbolDescriptionOrKey", "number", ["number", "number"]);
    this.QTS_IsGlobalSymbol = this.module.cwrap("QTS_IsGlobalSymbol", "number", ["number", "number"]);
    this.QTS_IsJobPending = this.module.cwrap("QTS_IsJobPending", "number", ["number"]);
    this.QTS_ExecutePendingJob = this.module.cwrap("QTS_ExecutePendingJob", "number", ["number", "number", "number"]);
    this.QTS_GetProp = this.module.cwrap("QTS_GetProp", "number", ["number", "number", "number"]);
    this.QTS_GetPropNumber = this.module.cwrap("QTS_GetPropNumber", "number", ["number", "number", "number"]);
    this.QTS_SetProp = this.module.cwrap("QTS_SetProp", null, ["number", "number", "number", "number"]);
    this.QTS_DefineProp = this.module.cwrap("QTS_DefineProp", null, ["number", "number", "number", "number", "number", "number", "boolean", "boolean", "boolean"]);
    this.QTS_GetOwnPropertyNames = this.module.cwrap("QTS_GetOwnPropertyNames", "number", ["number", "number", "number", "number", "number"]);
    this.QTS_Call = this.module.cwrap("QTS_Call", "number", ["number", "number", "number", "number", "number"]);
    this.QTS_ResolveException = this.module.cwrap("QTS_ResolveException", "number", ["number", "number"]);
    this.QTS_Dump = this.module.cwrap("QTS_Dump", "number", ["number", "number"]);
    this.QTS_Eval = this.module.cwrap("QTS_Eval", "number", ["number", "number", "number", "string", "number", "number"]);
    this.QTS_GetModuleNamespace = this.module.cwrap("QTS_GetModuleNamespace", "number", ["number", "number"]);
    this.QTS_Typeof = this.module.cwrap("QTS_Typeof", "number", ["number", "number"]);
    this.QTS_GetLength = this.module.cwrap("QTS_GetLength", "number", ["number", "number", "number"]);
    this.QTS_IsEqual = this.module.cwrap("QTS_IsEqual", "number", ["number", "number", "number", "number"]);
    this.QTS_GetGlobalObject = this.module.cwrap("QTS_GetGlobalObject", "number", ["number"]);
    this.QTS_NewPromiseCapability = this.module.cwrap("QTS_NewPromiseCapability", "number", ["number", "number"]);
    this.QTS_PromiseState = this.module.cwrap("QTS_PromiseState", "number", ["number", "number"]);
    this.QTS_PromiseResult = this.module.cwrap("QTS_PromiseResult", "number", ["number", "number"]);
    this.QTS_TestStringArg = this.module.cwrap("QTS_TestStringArg", null, ["string"]);
    this.QTS_GetDebugLogEnabled = this.module.cwrap("QTS_GetDebugLogEnabled", "number", ["number"]);
    this.QTS_SetDebugLogEnabled = this.module.cwrap("QTS_SetDebugLogEnabled", null, ["number", "number"]);
    this.QTS_BuildIsDebug = this.module.cwrap("QTS_BuildIsDebug", "number", []);
    this.QTS_BuildIsAsyncify = this.module.cwrap("QTS_BuildIsAsyncify", "number", []);
    this.QTS_NewFunction = this.module.cwrap("QTS_NewFunction", "number", ["number", "string", "number", "boolean", "number"]);
    this.QTS_ArgvGetJSValueConstPointer = this.module.cwrap("QTS_ArgvGetJSValueConstPointer", "number", ["number", "number"]);
    this.QTS_RuntimeEnableInterruptHandler = this.module.cwrap("QTS_RuntimeEnableInterruptHandler", null, ["number"]);
    this.QTS_RuntimeDisableInterruptHandler = this.module.cwrap("QTS_RuntimeDisableInterruptHandler", null, ["number"]);
    this.QTS_RuntimeEnableModuleLoader = this.module.cwrap("QTS_RuntimeEnableModuleLoader", null, ["number", "number"]);
    this.QTS_RuntimeDisableModuleLoader = this.module.cwrap("QTS_RuntimeDisableModuleLoader", null, ["number"]);
    this.QTS_bjson_encode = this.module.cwrap("QTS_bjson_encode", "number", ["number", "number"]);
    this.QTS_bjson_decode = this.module.cwrap("QTS_bjson_decode", "number", ["number", "number"]);
  }
};
var init_ffi = () => {};

// node_modules/.bun/@jitl+quickjs-wasmfile-release-sync@0.32.0/node_modules/@jitl/quickjs-wasmfile-release-sync/dist/emscripten-module.mjs
var exports_emscripten_module = {};
__export(exports_emscripten_module, {
  default: () => emscripten_module_default
});
async function QuickJSRaw(moduleArg = {}) {
  var moduleRtn;
  var d = moduleArg, aa = !!globalThis.window, n = !!globalThis.WorkerGlobalScope, q = globalThis.process?.versions?.node && globalThis.process?.type != "renderer";
  if (q) {
    const { createRequire: a } = await import("node:module");
    var require2 = a(import.meta.url);
  }
  function r(a) {
    a = { log: a || function() {} };
    for (const c of r.Pa)
      c(a);
    return d.quickJSEmscriptenExtensions = a;
  }
  r.Pa = [];
  d.quickjsEmscriptenInit = r;
  r.Pa.push((a) => {
    a.getWasmMemory = function() {
      return t;
    };
  });
  var u = "./this.program", v = (a, c) => {
    throw c;
  }, w = import.meta.url, y = "", z, A;
  if (q) {
    var fs = require2("node:fs");
    w.startsWith("file:") && (y = require2("node:path").dirname(require2("node:url").fileURLToPath(w)) + "/");
    A = (a) => {
      a = B(a) ? new URL(a) : a;
      return fs.readFileSync(a);
    };
    z = async (a) => {
      a = B(a) ? new URL(a) : a;
      return fs.readFileSync(a, undefined);
    };
    1 < process.argv.length && (u = process.argv[1].replace(/\\/g, "/"));
    process.argv.slice(2);
    v = (a, c) => {
      process.exitCode = a;
      throw c;
    };
  } else if (aa || n) {
    try {
      y = new URL(".", w).href;
    } catch {}
    n && (A = (a) => {
      var c = new XMLHttpRequest;
      c.open("GET", a, false);
      c.responseType = "arraybuffer";
      c.send(null);
      return new Uint8Array(c.response);
    });
    z = async (a) => {
      if (B(a))
        return new Promise((b, e) => {
          var f = new XMLHttpRequest;
          f.open("GET", a, true);
          f.responseType = "arraybuffer";
          f.onload = () => {
            f.status == 200 || f.status == 0 && f.response ? b(f.response) : e(f.status);
          };
          f.onerror = e;
          f.send(null);
        });
      var c = await fetch(a, { credentials: "same-origin" });
      if (c.ok)
        return c.arrayBuffer();
      throw Error(c.status + " : " + c.url);
    };
  }
  var C = console.log.bind(console), D = console.error.bind(console), E, F = false, G, B = (a) => a.startsWith("file://"), H, I, J, K, L, M, ba = false;
  function ca() {
    var a = t.buffer;
    d.HEAP8 = J = new Int8Array(a);
    new Int16Array(a);
    d.HEAPU8 = K = new Uint8Array(a);
    new Uint16Array(a);
    L = new Int32Array(a);
    M = new Uint32Array(a);
    new Float32Array(a);
    new Float64Array(a);
    new BigInt64Array(a);
    new BigUint64Array(a);
  }
  function N(a) {
    d.onAbort?.(a);
    a = "Aborted(" + a + ")";
    D(a);
    F = true;
    a = new WebAssembly.RuntimeError(a + ". Build with -sASSERTIONS for more info.");
    I?.(a);
    throw a;
  }
  var O;
  async function da(a) {
    if (!E)
      try {
        var c = await z(a);
        return new Uint8Array(c);
      } catch {}
    if (a == O && E)
      a = new Uint8Array(E);
    else if (A)
      a = A(a);
    else
      throw "both async and sync fetching of the wasm failed";
    return a;
  }
  async function ea(a, c) {
    try {
      var b = await da(a);
      return await WebAssembly.instantiate(b, c);
    } catch (e) {
      D(`failed to asynchronously prepare wasm: ${e}`), N(e);
    }
  }
  async function fa(a) {
    var c = O;
    if (!E && !B(c) && !q)
      try {
        var b = fetch(c, { credentials: "same-origin" });
        return await WebAssembly.instantiateStreaming(b, a);
      } catch (e) {
        D(`wasm streaming compile failed: ${e}`), D("falling back to ArrayBuffer instantiation");
      }
    return ea(c, a);
  }

  class P {
    name = "ExitStatus";
    constructor(a) {
      this.message = `Program terminated with exit(${a})`;
      this.status = a;
    }
  }
  var ha = (a) => {
    for (;0 < a.length; )
      a.shift()(d);
  }, ia = [], ja = [], ka = () => {
    var a = d.preRun.shift();
    ja.push(a);
  }, Q = true, t, la = new TextDecoder, ma = (a, c, b, e) => {
    b = c + b;
    if (e)
      return b;
    for (;a[c] && !(c >= b); )
      ++c;
    return c;
  }, R = (a, c, b) => a ? la.decode(K.subarray(a, ma(K, a, c, b))) : "", S = 0, na = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], oa = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334], T = {}, pa = (a) => {
    G = a;
    Q || 0 < S || (d.onExit?.(a), F = true);
    v(a, new P(a));
  }, qa = (a) => {
    if (!F)
      try {
        a();
      } catch (c) {
        c instanceof P || c == "unwind" || v(1, c);
      } finally {
        if (!(Q || 0 < S))
          try {
            G = a = G, pa(a);
          } catch (c) {
            c instanceof P || c == "unwind" || v(1, c);
          }
      }
  }, U = (a, c, b) => {
    var e = K;
    if (!(0 < b))
      return 0;
    var f = c;
    b = c + b - 1;
    for (var g = 0;g < a.length; ++g) {
      var h = a.codePointAt(g);
      if (127 >= h) {
        if (c >= b)
          break;
        e[c++] = h;
      } else if (2047 >= h) {
        if (c + 1 >= b)
          break;
        e[c++] = 192 | h >> 6;
        e[c++] = 128 | h & 63;
      } else if (65535 >= h) {
        if (c + 2 >= b)
          break;
        e[c++] = 224 | h >> 12;
        e[c++] = 128 | h >> 6 & 63;
        e[c++] = 128 | h & 63;
      } else {
        if (c + 3 >= b)
          break;
        e[c++] = 240 | h >> 18;
        e[c++] = 128 | h >> 12 & 63;
        e[c++] = 128 | h >> 6 & 63;
        e[c++] = 128 | h & 63;
        g++;
      }
    }
    e[c] = 0;
    return c - f;
  }, V = {}, ra = () => {
    if (!W) {
      var a = {
        USER: "web_user",
        LOGNAME: "web_user",
        PATH: "/",
        PWD: "/",
        HOME: "/home/web_user",
        LANG: (globalThis.navigator?.language ?? "C").replace("-", "_") + ".UTF-8",
        _: u || "./this.program"
      }, c;
      for (c in V)
        V[c] === undefined ? delete a[c] : a[c] = V[c];
      var b = [];
      for (c in a)
        b.push(`${c}=${a[c]}`);
      W = b;
    }
    return W;
  }, W, X = (a) => {
    for (var c = 0, b = 0;b < a.length; ++b) {
      var e = a.charCodeAt(b);
      127 >= e ? c++ : 2047 >= e ? c += 2 : 55296 <= e && 57343 >= e ? (c += 4, ++b) : c += 3;
    }
    return c;
  }, sa = [null, [], []], va = (a, c, b, e) => {
    var f = { string: (k) => {
      var l = 0;
      if (k !== null && k !== undefined && k !== 0) {
        l = X(k) + 1;
        var p = Y(l);
        U(k, p, l);
        l = p;
      }
      return l;
    }, array: (k) => {
      var l = Y(k.length);
      J.set(k, l);
      return l;
    } };
    a = d["_" + a];
    var g = [], h = 0;
    if (e)
      for (var m = 0;m < e.length; m++) {
        var x = f[b[m]];
        x ? (h === 0 && (h = ta()), g[m] = x(e[m])) : g[m] = e[m];
      }
    b = a(...g);
    return b = function(k) {
      h !== 0 && ua(h);
      return c === "string" ? R(k) : c === "boolean" ? !!k : k;
    }(b);
  };
  d.wasmMemory ? t = d.wasmMemory : t = new WebAssembly.Memory({ initial: (d.INITIAL_MEMORY || 16777216) / 65536, maximum: 32768 });
  ca();
  d.noExitRuntime && (Q = d.noExitRuntime);
  d.print && (C = d.print);
  d.printErr && (D = d.printErr);
  d.wasmBinary && (E = d.wasmBinary);
  d.thisProgram && (u = d.thisProgram);
  if (d.preInit)
    for (typeof d.preInit == "function" && (d.preInit = [d.preInit]);0 < d.preInit.length; )
      d.preInit.shift()();
  d.cwrap = (a, c, b, e) => {
    var f = !b || b.every((g) => g === "number" || g === "boolean");
    return c !== "string" && f && !e ? d["_" + a] : (...g) => va(a, c, b, g);
  };
  d.UTF8ToString = R;
  d.stringToUTF8 = (a, c, b) => U(a, c, b);
  d.lengthBytesUTF8 = X;
  var wa, ua, Y, ta, xa = { b: (a, c, b, e) => N(`Assertion failed: ${R(a)}, at: ` + [c ? R(c) : "unknown filename", b, e ? R(e) : "unknown function"]), q: () => N(""), l: () => {
    Q = false;
    S = 0;
  }, m: function(a, c) {
    a = -9007199254740992 > a || 9007199254740992 < a ? NaN : Number(a);
    a = new Date(1000 * a);
    L[c >> 2] = a.getSeconds();
    L[c + 4 >> 2] = a.getMinutes();
    L[c + 8 >> 2] = a.getHours();
    L[c + 12 >> 2] = a.getDate();
    L[c + 16 >> 2] = a.getMonth();
    L[c + 20 >> 2] = a.getFullYear() - 1900;
    L[c + 24 >> 2] = a.getDay();
    var b = a.getFullYear();
    L[c + 28 >> 2] = (b % 4 !== 0 || b % 100 === 0 && b % 400 !== 0 ? oa : na)[a.getMonth()] + a.getDate() - 1 | 0;
    L[c + 36 >> 2] = -(60 * a.getTimezoneOffset());
    b = new Date(a.getFullYear(), 6, 1).getTimezoneOffset();
    var e = new Date(a.getFullYear(), 0, 1).getTimezoneOffset();
    L[c + 32 >> 2] = (b != e && a.getTimezoneOffset() == Math.min(e, b)) | 0;
  }, j: (a, c) => {
    T[a] && (clearTimeout(T[a].id), delete T[a]);
    if (!c)
      return 0;
    var b = setTimeout(() => {
      delete T[a];
      qa(() => wa(a, performance.now()));
    }, c);
    T[a] = { id: b, Qa: c };
    return 0;
  }, n: (a, c, b, e) => {
    var f = new Date().getFullYear(), g = new Date(f, 0, 1).getTimezoneOffset();
    f = new Date(f, 6, 1).getTimezoneOffset();
    M[a >> 2] = 60 * Math.max(g, f);
    L[c >> 2] = Number(g != f);
    c = (h) => {
      var m = Math.abs(h);
      return `UTC${0 <= h ? "-" : "+"}${String(Math.floor(m / 60)).padStart(2, "0")}${String(m % 60).padStart(2, "0")}`;
    };
    a = c(g);
    c = c(f);
    f < g ? (U(a, b, 17), U(c, e, 17)) : (U(a, e, 17), U(c, b, 17));
  }, p: () => Date.now(), k: (a) => {
    var c = K.length;
    a >>>= 0;
    if (2147483648 < a)
      return false;
    for (var b = 1;4 >= b; b *= 2) {
      var e = c * (1 + 0.2 / b);
      e = Math.min(e, a + 100663296);
      a: {
        e = (Math.min(2147483648, 65536 * Math.ceil(Math.max(a, e) / 65536)) - t.buffer.byteLength + 65535) / 65536 | 0;
        try {
          t.grow(e);
          ca();
          var f = 1;
          break a;
        } catch (g) {}
        f = undefined;
      }
      if (f)
        return true;
    }
    return false;
  }, e: (a, c) => {
    var b = 0, e = 0, f;
    for (f of ra()) {
      var g = c + b;
      M[a + e >> 2] = g;
      b += U(f, g, Infinity) + 1;
      e += 4;
    }
    return 0;
  }, f: (a, c) => {
    var b = ra();
    M[a >> 2] = b.length;
    a = 0;
    for (var e of b)
      a += X(e) + 1;
    M[c >> 2] = a;
    return 0;
  }, d: () => 52, o: function() {
    return 70;
  }, c: (a, c, b, e) => {
    for (var f = 0, g = 0;g < b; g++) {
      var h = M[c >> 2], m = M[c + 4 >> 2];
      c += 8;
      for (var x = 0;x < m; x++) {
        var k = a, l = K[h + x], p = sa[k];
        l === 0 || l === 10 ? (k = k === 1 ? C : D, l = ma(p, 0), l = la.decode(p.buffer ? p.subarray(0, l) : new Uint8Array(p.slice(0, l))), k(l), p.length = 0) : p.push(l);
      }
      f += m;
    }
    M[e >> 2] = f;
    return 0;
  }, a: t, r: pa, s: function(a, c, b, e, f) {
    return d.callbacks.callFunction(undefined, a, c, b, e, f);
  }, i: function(a) {
    return d.callbacks.shouldInterrupt(undefined, a);
  }, h: function(a, c, b) {
    b = R(b);
    return d.callbacks.loadModuleSource(undefined, a, c, b);
  }, g: function(a, c, b, e) {
    b = R(b);
    e = R(e);
    return d.callbacks.normalizeModule(undefined, a, c, b, e);
  }, t: function(a, c) {
    d.callbacks.freeHostRef(undefined, a, c);
  } }, Z;
  Z = await async function() {
    function a(b) {
      b = Z = b.exports;
      d._malloc = b.v;
      d._QTS_Throw = b.w;
      d._QTS_NewError = b.x;
      d._QTS_RuntimeSetMemoryLimit = b.y;
      d._QTS_RuntimeComputeMemoryUsage = b.z;
      d._QTS_RuntimeDumpMemoryUsage = b.A;
      d._QTS_RecoverableLeakCheck = b.B;
      d._QTS_BuildIsSanitizeLeak = b.C;
      d._QTS_RuntimeSetMaxStackSize = b.D;
      d._QTS_GetUndefined = b.E;
      d._QTS_GetNull = b.F;
      d._QTS_GetFalse = b.G;
      d._QTS_GetTrue = b.H;
      d._QTS_NewHostRef = b.I;
      d._QTS_GetHostRefId = b.J;
      d._QTS_NewRuntime = b.K;
      d._QTS_FreeRuntime = b.L;
      d._free = b.M;
      d._QTS_NewContext = b.N;
      d._QTS_FreeContext = b.O;
      d._QTS_FreeValuePointer = b.P;
      d._QTS_FreeValuePointerRuntime = b.Q;
      d._QTS_FreeVoidPointer = b.R;
      d._QTS_FreeCString = b.S;
      d._QTS_DupValuePointer = b.T;
      d._QTS_NewObject = b.U;
      d._QTS_NewObjectProto = b.V;
      d._QTS_NewArray = b.W;
      d._QTS_NewArrayBuffer = b.X;
      d._QTS_NewFloat64 = b.Y;
      d._QTS_GetFloat64 = b.Z;
      d._QTS_NewString = b._;
      d._QTS_GetString = b.$;
      d._QTS_GetArrayBuffer = b.aa;
      d._QTS_GetArrayBufferLength = b.ba;
      d._QTS_NewSymbol = b.ca;
      d._QTS_GetSymbolDescriptionOrKey = b.da;
      d._QTS_IsGlobalSymbol = b.ea;
      d._QTS_IsJobPending = b.fa;
      d._QTS_ExecutePendingJob = b.ga;
      d._QTS_GetProp = b.ha;
      d._QTS_GetPropNumber = b.ia;
      d._QTS_SetProp = b.ja;
      d._QTS_DefineProp = b.ka;
      d._QTS_GetOwnPropertyNames = b.la;
      d._QTS_Call = b.ma;
      d._QTS_ResolveException = b.na;
      d._QTS_Dump = b.oa;
      d._QTS_Eval = b.pa;
      d._QTS_GetModuleNamespace = b.qa;
      d._QTS_Typeof = b.ra;
      d._QTS_GetLength = b.sa;
      d._QTS_IsEqual = b.ta;
      d._QTS_GetGlobalObject = b.ua;
      d._QTS_NewPromiseCapability = b.va;
      d._QTS_PromiseState = b.wa;
      d._QTS_PromiseResult = b.xa;
      d._QTS_TestStringArg = b.ya;
      d._QTS_GetDebugLogEnabled = b.za;
      d._QTS_SetDebugLogEnabled = b.Aa;
      d._QTS_BuildIsDebug = b.Ba;
      d._QTS_BuildIsAsyncify = b.Ca;
      d._QTS_NewFunction = b.Da;
      d._QTS_ArgvGetJSValueConstPointer = b.Ea;
      d._QTS_RuntimeEnableInterruptHandler = b.Fa;
      d._QTS_RuntimeDisableInterruptHandler = b.Ga;
      d._QTS_RuntimeEnableModuleLoader = b.Ha;
      d._QTS_RuntimeDisableModuleLoader = b.Ia;
      d._QTS_bjson_encode = b.Ja;
      d._QTS_bjson_decode = b.Ka;
      wa = b.La;
      ua = b.Ma;
      Y = b.Na;
      ta = b.Oa;
      return Z;
    }
    var c = { a: xa };
    if (d.instantiateWasm)
      return new Promise((b) => {
        d.instantiateWasm(c, (e, f) => {
          b(a(e, f));
        });
      });
    O ??= d.locateFile ? d.locateFile ? d.locateFile("emscripten-module.wasm", y) : y + "emscripten-module.wasm" : new URL("emscripten-module.wasm", import.meta.url).href;
    return a((await fa(c)).instance);
  }();
  (function() {
    function a() {
      d.calledRun = true;
      if (!F) {
        ba = true;
        Z.u();
        H?.(d);
        d.onRuntimeInitialized?.();
        if (d.postRun)
          for (typeof d.postRun == "function" && (d.postRun = [d.postRun]);d.postRun.length; ) {
            var c = d.postRun.shift();
            ia.push(c);
          }
        ha(ia);
      }
    }
    if (d.preRun)
      for (typeof d.preRun == "function" && (d.preRun = [d.preRun]);d.preRun.length; )
        ka();
    ha(ja);
    d.setStatus ? (d.setStatus("Running..."), setTimeout(() => {
      setTimeout(() => d.setStatus(""), 1);
      a();
    }, 1)) : a();
  })();
  ba ? moduleRtn = d : moduleRtn = new Promise((a, c) => {
    H = a;
    I = c;
  });
  return moduleRtn;
}
var emscripten_module_default;
var init_emscripten_module = __esm(() => {
  emscripten_module_default = QuickJSRaw;
});

// packages/check/src/sandbox/worker.ts
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { parentPort, workerData } from "node:worker_threads";

// node_modules/.bun/quickjs-emscripten-core@0.32.0/node_modules/quickjs-emscripten-core/dist/index.mjs
init_chunk_V2S4ZYJR();
init_dist();
async function newQuickJSWASMModuleFromVariant(variantOrPromise) {
  let variant = smartUnwrap(await variantOrPromise), [wasmModuleLoader, QuickJSFFI, { QuickJSWASMModule: QuickJSWASMModule2 }] = await Promise.all([variant.importModuleLoader().then(smartUnwrap), variant.importFFI(), Promise.resolve().then(() => (init_module_ES6BEMUI(), exports_module_ES6BEMUI)).then(smartUnwrap)]), wasmModule = await wasmModuleLoader();
  wasmModule.type = "sync";
  let ffi = new QuickJSFFI(wasmModule);
  return new QuickJSWASMModule2(wasmModule, ffi);
}
function smartUnwrap(val) {
  return val && "default" in val && val.default ? val.default && "default" in val.default && val.default.default ? val.default.default : val.default : val;
}
function newVariant(baseVariant, options) {
  return { ...baseVariant, async importModuleLoader() {
    let moduleLoader = smartUnwrap(await baseVariant.importModuleLoader());
    return async function() {
      let moduleLoaderArg = options.emscriptenModule ? { ...options.emscriptenModule } : {}, log = options.log ?? ((...args) => debugLog("newVariant moduleLoader:", ...args)), tapValue = (message, val) => (log(...message, val), val), force = (val) => typeof val == "function" ? val() : val;
      (options.wasmLocation || options.wasmSourceMapLocation || options.locateFile) && (moduleLoaderArg.locateFile = (fileName, relativeTo) => {
        let args = { fileName, relativeTo };
        if (fileName.endsWith(".wasm") && options.wasmLocation !== undefined)
          return tapValue(["locateFile .wasm: provide wasmLocation", args], options.wasmLocation);
        if (fileName.endsWith(".map")) {
          if (options.wasmSourceMapLocation !== undefined)
            return tapValue(["locateFile .map: provide wasmSourceMapLocation", args], options.wasmSourceMapLocation);
          if (options.wasmLocation && !options.locateFile)
            return tapValue(["locateFile .map: infer from wasmLocation", args], options.wasmLocation + ".map");
        }
        return options.locateFile ? tapValue(["locateFile: use provided fn", args], options.locateFile(fileName, relativeTo)) : tapValue(["locateFile: unhandled, passthrough", args], fileName);
      }), options.wasmBinary && (moduleLoaderArg.wasmBinary = await force(options.wasmBinary)), options.wasmMemory && (moduleLoaderArg.wasmMemory = await force(options.wasmMemory));
      let optionsWasmModule = options.wasmModule, modulePromise;
      optionsWasmModule && (moduleLoaderArg.instantiateWasm = async (imports, onSuccess) => {
        modulePromise ?? (modulePromise = Promise.resolve(force(optionsWasmModule)));
        let wasmModule = await modulePromise;
        if (!wasmModule)
          throw new QuickJSEmscriptenModuleError(`options.wasmModule returned ${String(wasmModule)}`);
        let instance = await WebAssembly.instantiate(wasmModule, imports);
        return onSuccess(instance), instance.exports;
      }), moduleLoaderArg.monitorRunDependencies = (left) => {
        log("monitorRunDependencies:", left);
      }, moduleLoaderArg.quickjsEmscriptenInit = () => newMockExtensions(log);
      let resultPromise = moduleLoader(moduleLoaderArg), extensions = moduleLoaderArg.quickjsEmscriptenInit?.(log);
      if (optionsWasmModule && extensions?.receiveWasmOffsetConverter && !extensions.existingWasmOffsetConverter) {
        let wasmBinary = await force(options.wasmBinary) ?? new ArrayBuffer(0);
        modulePromise ?? (modulePromise = Promise.resolve(force(optionsWasmModule)));
        let wasmModule = await modulePromise;
        if (!wasmModule)
          throw new QuickJSEmscriptenModuleError(`options.wasmModule returned ${String(wasmModule)}`);
        extensions.receiveWasmOffsetConverter(wasmBinary, wasmModule);
      }
      if (extensions?.receiveSourceMapJSON) {
        let loadedSourceMapData = await force(options.wasmSourceMapData);
        typeof loadedSourceMapData == "string" ? extensions.receiveSourceMapJSON(JSON.parse(loadedSourceMapData)) : loadedSourceMapData ? extensions.receiveSourceMapJSON(loadedSourceMapData) : extensions.receiveSourceMapJSON({ version: 3, names: [], sources: [], mappings: "" });
      }
      return resultPromise;
    };
  } };
}
function newMockExtensions(log) {
  let mockMessage = "mock called, emscripten module may not be initialized yet";
  return { mock: true, removeRunDependency(name) {
    log(`${mockMessage}: removeRunDependency called:`, name);
  }, receiveSourceMapJSON(data) {
    log(`${mockMessage}: receiveSourceMapJSON called:`, data);
  }, WasmOffsetConverter: undefined, receiveWasmOffsetConverter(bytes, mod) {
    log(`${mockMessage}: receiveWasmOffsetConverter called:`, bytes, mod);
  } };
}

// node_modules/.bun/@jitl+quickjs-wasmfile-release-sync@0.32.0/node_modules/@jitl/quickjs-wasmfile-release-sync/dist/index.mjs
var variant = { type: "sync", importFFI: () => Promise.resolve().then(() => (init_ffi(), exports_ffi)).then((mod) => mod.QuickJSFFI), importModuleLoader: () => Promise.resolve().then(() => (init_emscripten_module(), exports_emscripten_module)).then((mod) => mod.default) };
var src_default = variant;
// packages/protocol/src/limits.ts
var FLOORS = {
  codeChars: 48000,
  checkMs: 2000,
  describeBytes: 262144,
  canvasSize: 4096
};
var FIXED = {
  bodyChars: 65536,
  manualChars: 48000,
  depsMax: 16,
  libCountMax: 16,
  libBytesMax: 4194304,
  libTotalBytesMax: 16777216,
  bundleBytesMax: 16777216,
  modulesMax: 2000,
  wasmMemoryBytes: 67108864,
  childExtraBytes: 134217728,
  messagesPerSecond: 1000,
  textCharsPerCall: 2000,
  textTotalBytes: 65536,
  titleChars: 200,
  licenseChars: 100,
  watchIntervalMs: 25,
  childGraceMs: 500,
  parentGraceMs: 2000,
  watchLoadMs: 1e4,
  watchSilenceMs: 2000,
  pingMs: 250,
  fetchTimeoutMs: 30000,
  apiBytesMax: 8388608,
  frameGapMs: 1000,
  frameTickMs: 100,
  frameTickSlackMs: 500,
  errorsMax: 20,
  errorChars: 300,
  frameReadyMs: 1e4,
  textLinesMax: 200,
  keyChars: 32
};
var LIMIT_RANGES = {
  codeChars: { min: 1, max: FLOORS.codeChars },
  checkMs: { min: 1, max: FLOORS.checkMs },
  describeBytes: { min: 1, max: FLOORS.describeBytes },
  canvasWidth: { min: 16, max: FLOORS.canvasSize },
  canvasHeight: { min: 16, max: FLOORS.canvasSize }
};
// packages/protocol/src/digest.ts
var encoder = new TextEncoder;
var utf8Bytes = (text) => encoder.encode(text).length;
// packages/protocol/src/reveal.ts
var BLANK_LOOKING = new Set(["⠀", "\uD81B\uDFE4", "\uD834\uDD59"]);
// packages/protocol/src/text.ts
var ALNUM = "0-9A-Za-z\\uFF10-\\uFF19\\uFF21-\\uFF3A\\uFF41-\\uFF5A";
var CODE_CHAR = "[0-9A-Z\\uFF10-\\uFF19\\uFF21-\\uFF3A]";
var AUTH_CODE = new RegExp(`(?<![${ALNUM}])${CODE_CHAR}{4}\\s{0,3}[-\\u2010-\\u2015\\u2212\\uFE58\\uFE63\\uFF0D]\\s{0,3}` + `${CODE_CHAR}{4}(?![${ALNUM}])`, "gu");
// packages/check/src/sandbox/leb128.ts
var MAX_U32 = 4294967295;
var readUnsignedLeb128 = (bytes, offset) => {
  let value = 0;
  let scale = 1;
  for (let index = 0;index < 5; index += 1) {
    const byte = bytes[offset + index];
    if (byte === undefined)
      return;
    value += (byte & 127) * scale;
    if ((byte & 128) === 0)
      return { value, next: offset + index + 1 };
    scale *= 128;
  }
  return;
};
var encodeUnsignedLeb128Padded = (value, byteLength) => {
  if (!Number.isInteger(value) || value < 0 || value > MAX_U32 || !Number.isInteger(byteLength) || byteLength < 1) {
    return;
  }
  const groups = [];
  let rest = value;
  do {
    groups.push(rest % 128);
    rest = Math.floor(rest / 128);
  } while (rest > 0);
  if (groups.length > byteLength)
    return;
  while (groups.length < byteLength)
    groups.push(0);
  const out = new Uint8Array(byteLength);
  for (let index = 0;index < groups.length; index += 1) {
    const group = groups[index] ?? 0;
    out[index] = index === groups.length - 1 ? group : group | 128;
  }
  return out;
};

// packages/check/src/sandbox/wasm-memory.ts
var PAGE_BYTES = 65536;
var CAPPED_PAGES = FIXED.wasmMemoryBytes / PAGE_BYTES;
var SECTION_IMPORT = 2;
var SECTION_MEMORY = 5;
var IMPORT_KIND_FUNC = 0;
var IMPORT_KIND_TABLE = 1;
var IMPORT_KIND_MEMORY = 2;
var IMPORT_KIND_GLOBAL = 3;
var IMPORT_KIND_TAG = 4;
var readByte = (cursor) => {
  const value = cursor.bytes[cursor.offset];
  if (value === undefined)
    return;
  cursor.offset += 1;
  return value;
};
var readLeb = (cursor) => {
  const read = readUnsignedLeb128(cursor.bytes, cursor.offset);
  if (!read)
    return;
  cursor.offset = read.next;
  return read.value;
};
var readName = (cursor) => {
  const length = readLeb(cursor);
  if (length === undefined || length > cursor.bytes.length)
    return;
  const start = cursor.offset;
  const end = start + length;
  if (end > cursor.bytes.length)
    return;
  cursor.offset = end;
  return new TextDecoder().decode(cursor.bytes.slice(start, end));
};
var readLimits = (cursor, where) => {
  const flags = readByte(cursor);
  if (flags === undefined)
    return;
  const min = readLeb(cursor);
  if (min === undefined)
    return;
  if ((flags & 1) === 0)
    return;
  const maxOffset = cursor.offset;
  const max = readLeb(cursor);
  if (max === undefined)
    return;
  return { where, minPages: min, maxPages: max, maxOffset, maxByteLength: cursor.offset - maxOffset };
};
var skipLimits = (cursor) => {
  const flags = readByte(cursor);
  if (flags === undefined || readLeb(cursor) === undefined)
    return false;
  if ((flags & 1) === 0)
    return true;
  return readLeb(cursor) !== undefined;
};
var readImportEntry = (cursor, index, sites) => {
  const moduleName = readName(cursor);
  const fieldName = readName(cursor);
  const kind = readByte(cursor);
  if (moduleName === undefined || fieldName === undefined || kind === undefined)
    return false;
  const where = `import ${moduleName}.${fieldName} (#${index})`;
  if (kind === IMPORT_KIND_MEMORY) {
    const site = readLimits(cursor, where);
    if (site)
      sites.push(site);
    return true;
  }
  if (kind === IMPORT_KIND_FUNC)
    return readLeb(cursor) !== undefined;
  if (kind === IMPORT_KIND_TABLE)
    return readByte(cursor) !== undefined && skipLimits(cursor);
  if (kind === IMPORT_KIND_GLOBAL)
    return readByte(cursor) !== undefined && readByte(cursor) !== undefined;
  if (kind === IMPORT_KIND_TAG)
    return readByte(cursor) !== undefined && readLeb(cursor) !== undefined;
  return false;
};
var scanSection = (cursor, id, end, sites) => {
  if (id === SECTION_IMPORT) {
    const count = readLeb(cursor);
    if (count === undefined)
      return false;
    for (let index = 0;index < count; index += 1) {
      if (!readImportEntry(cursor, index, sites))
        return false;
    }
  } else if (id === SECTION_MEMORY) {
    const count = readLeb(cursor);
    if (count === undefined)
      return false;
    for (let index = 0;index < count; index += 1) {
      const site = readLimits(cursor, `defined memory #${index}`);
      if (site)
        sites.push(site);
    }
  }
  cursor.offset = end;
  return true;
};
var findMemoryLimits = (bytes) => {
  const cursor = { bytes, offset: 8 };
  const sites = [];
  while (cursor.offset < bytes.length) {
    const id = readByte(cursor);
    const size = readLeb(cursor);
    if (id === undefined || size === undefined)
      break;
    const end = cursor.offset + size;
    if (end > bytes.length)
      break;
    if (!scanSection(cursor, id, end, sites))
      break;
  }
  return sites;
};
var patchMemoryMaxPages = (bytes, targetPages) => {
  const sites = findMemoryLimits(bytes);
  const out = new Uint8Array(bytes);
  if (sites.length === 0)
    return { bytes: out, sites, error: "メモリの最大ページ数が見つからなかった" };
  for (const site of sites) {
    const encoded = encodeUnsignedLeb128Padded(targetPages, site.maxByteLength);
    if (!encoded) {
      return {
        bytes: out,
        sites,
        error: `${site.where}: ${targetPages} ページを ${site.maxByteLength} バイトの LEB128 で表せない`
      };
    }
    out.set(encoded, site.maxOffset);
  }
  return { bytes: out, sites };
};

// packages/check/src/sandbox/engine.ts
var toArrayBuffer = (bytes) => {
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  return copy;
};
var loadEngineFromBytes = async (bytes) => {
  if (!Number.isInteger(CAPPED_PAGES) || CAPPED_PAGES < 1)
    throw new Error("メモリの上限のページ数が不正");
  const patched = patchMemoryMaxPages(bytes, CAPPED_PAGES);
  if (patched.error !== undefined)
    throw new Error(patched.error);
  const site = patched.sites[0];
  if (site === undefined || site.minPages > CAPPED_PAGES)
    throw new Error("メモリの上限を書き換えられない");
  const variant2 = newVariant(src_default, {
    wasmBinary: toArrayBuffer(patched.bytes),
    wasmMemory: new WebAssembly.Memory({ initial: site.minPages, maximum: CAPPED_PAGES })
  });
  return newQuickJSWASMModuleFromVariant(variant2);
};

// packages/check/src/sandbox/job.ts
var MAX_JOB_BYTES = FIXED.bundleBytesMax * 2;
var isRecord2 = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
var isPositiveInteger = (value) => typeof value === "number" && Number.isInteger(value) && value > 0;
var parseJob = (value) => {
  if (!isRecord2(value))
    return;
  const name = value["name"];
  const code = value["code"];
  const deps = value["deps"];
  const checkMs = value["checkMs"];
  const describeBytes = value["describeBytes"];
  if (typeof name !== "string" || typeof code !== "string" || !Array.isArray(deps))
    return;
  if (!isPositiveInteger(checkMs) || checkMs > FLOORS.checkMs)
    return;
  if (!isPositiveInteger(describeBytes) || describeBytes > FLOORS.describeBytes)
    return;
  let total = utf8Bytes(name) + utf8Bytes(code);
  const parsed = [];
  for (const item of deps) {
    if (!isRecord2(item))
      return;
    const depName = item["name"];
    const source = item["source"];
    if (typeof depName !== "string" || typeof source !== "string")
      return;
    total += utf8Bytes(depName) + utf8Bytes(source);
    if (total > MAX_JOB_BYTES)
      return;
    parsed.push({ name: depName, source });
  }
  if (total > MAX_JOB_BYTES)
    return;
  return { name, code, deps: parsed, checkMs, describeBytes };
};

// packages/check/src/sandbox/guest.ts
var GUEST_MEMORY_BYTES = 40 * 1024 * 1024;
var GUEST_STACK_BYTES = 512 * 1024;
var PRELUDE = `(function () {
  "use strict";
  var samples = [function () {}, async function () {}, function* () {}, async function* () {}];
  var seen = [];
  for (var i = 0; i < samples.length; i += 1) {
    var proto = Object.getPrototypeOf(samples[i]);
    if (seen.indexOf(proto) !== -1) { continue; }
    seen.push(proto);
    Object.defineProperty(proto, "constructor", {
      value: undefined,
      configurable: false,
      writable: false
    });
  }
  delete globalThis.Function;
  delete globalThis.eval;
  delete globalThis.Date;
  var fixed = function () { return 0.42000000000000004; };
  Object.defineProperty(Math, "random", { value: fixed, configurable: false, writable: false });
})();`;
var HELPERS = `(function () {
  var stringify = JSON.stringify;
  var charCodeAt = String.prototype.charCodeAt;
  return {
    encode: function (value, maxBytes) {
      var text;
      try {
        text = stringify(value);
      } catch (error) {
        return { kind: "bad" };
      }
      if (typeof text !== "string") { return { kind: "bad" }; }
      var bytes = 0;
      for (var i = 0; i < text.length; i += 1) {
        var code = charCodeAt.call(text, i);
        if (code < 0x80) { bytes += 1; }
        else if (code < 0x800) { bytes += 2; }
        else if (code >= 0xd800 && code <= 0xdbff) { bytes += 4; i += 1; }
        else { bytes += 3; }
        if (bytes > maxBytes) { return { kind: "too-large" }; }
      }
      return { kind: "ok" };
    }
  };
})()`;

// packages/check/src/sandbox/run.ts
var errorText = (vm, scope, handle) => {
  const parts = [];
  try {
    const nameHandle = scope.manage(vm.getProp(handle, "name"));
    if (vm.typeof(nameHandle) === "string")
      parts.push(vm.getString(nameHandle).slice(0, 100));
    const messageHandle = scope.manage(vm.getProp(handle, "message"));
    if (vm.typeof(messageHandle) === "string")
      parts.push(vm.getString(messageHandle).slice(0, 300));
  } catch {}
  if (parts.length > 0)
    return parts.join(": ");
  try {
    const dumped = vm.dump(handle);
    return typeof dumped === "string" ? dumped.slice(0, 400) : "guest error";
  } catch {
    return "guest error";
  }
};
var classify = (phase, interrupted, message) => {
  if (interrupted)
    return "timeout";
  const lower = message.toLowerCase();
  if (lower.includes("out of memory") || lower.includes("memory access out of bounds") || lower.includes("string too long") || lower.includes("allocation failed") || lower.includes("grow")) {
    return "memory";
  }
  if (phase === "prelude")
    return "internal";
  return phase === "describe" ? "bad-describe" : "load-error";
};
var setLoader = (rt, job) => {
  const sources = new Map;
  sources.set(`room:${job.name}`, job.code);
  for (const dep of job.deps) {
    const key = `room:${dep.name}`;
    if (!sources.has(key))
      sources.set(key, dep.source);
  }
  rt.setModuleLoader((moduleName) => {
    const source = sources.get(moduleName);
    return source === undefined ? { error: new Error("module not found") } : source;
  }, (_baseModuleName, requestedName) => requestedName);
};
var evalGlobal = (vm, scope, source, name) => {
  const result = vm.evalCode(source, name, { type: "global" });
  if (result.error)
    return errorText(vm, scope, scope.manage(result.error));
  scope.manage(result.value);
  return;
};
var createHelpers = (vm, scope) => {
  const result = vm.evalCode(HELPERS, "sandbox-helpers.js", { type: "global" });
  if (result.error) {
    scope.manage(result.error);
    return;
  }
  return { encode: scope.manage(vm.getProp(scope.manage(result.value), "encode")) };
};
var settle = (vm, rt, scope, value, expired) => {
  for (;; ) {
    const state = vm.getPromiseState(value);
    if (state.type === "fulfilled") {
      return { failed: false, handle: state.notAPromise === true ? value : scope.manage(state.value) };
    }
    if (state.type === "rejected") {
      return { failed: true, message: errorText(vm, scope, scope.manage(state.error)) };
    }
    if (expired())
      return { failed: true, message: "期限を過ぎた" };
    const jobs = rt.executePendingJobs(1);
    if (jobs.error)
      return { failed: true, message: errorText(vm, scope, scope.manage(jobs.error)) };
    if (jobs.value === 0)
      return { failed: true, message: "Promise が解決しない" };
  }
};
var encodeDescribe = (vm, scope, encode, value, job, isInterrupted) => {
  const limit = scope.manage(vm.newNumber(job.describeBytes));
  const encoded = vm.callFunction(encode, vm.undefined, value, limit);
  if (encoded.error) {
    return classify("describe", isInterrupted(), errorText(vm, scope, scope.manage(encoded.error)));
  }
  const kindHandle = scope.manage(vm.getProp(scope.manage(encoded.value), "kind"));
  const ok2 = vm.typeof(kindHandle) === "string" && vm.getString(kindHandle) === "ok";
  return ok2 ? "ok" : "bad-describe";
};
var evaluate = (job, vm, rt, scope, expired) => {
  const result = vm.evalCode(job.code, `room:${job.name}`, { type: "module" });
  if (result.error)
    return { failed: true, message: errorText(vm, scope, scope.manage(result.error)) };
  return settle(vm, rt, scope, scope.manage(result.value), expired);
};
var runGuest = (job, engine) => {
  const scope = new Scope;
  let phase = "prelude";
  let interrupted = false;
  try {
    const rt = scope.manage(engine.newRuntime());
    rt.setMemoryLimit(GUEST_MEMORY_BYTES);
    rt.setMaxStackSize(GUEST_STACK_BYTES);
    const deadline = Date.now() + job.checkMs;
    const expired = () => {
      if (Date.now() >= deadline) {
        interrupted = true;
        return true;
      }
      return false;
    };
    rt.setInterruptHandler(expired);
    const vm = scope.manage(rt.newContext({ intrinsics: { ...DefaultIntrinsics, Date: false } }));
    setLoader(rt, job);
    const preludeError = evalGlobal(vm, scope, PRELUDE, "sandbox-prelude.js");
    if (preludeError !== undefined)
      return classify("prelude", interrupted, preludeError);
    const helpers = createHelpers(vm, scope);
    if (!helpers)
      return "internal";
    phase = "load";
    const loaded = evaluate(job, vm, rt, scope, expired);
    if (loaded.failed)
      return classify(phase, interrupted, loaded.message);
    phase = "describe";
    const describe = scope.manage(vm.getProp(loaded.handle, "describe"));
    if (vm.typeof(describe) !== "function")
      return "ok";
    const called = vm.callFunction(describe, vm.undefined);
    if (called.error)
      return classify(phase, interrupted, errorText(vm, scope, scope.manage(called.error)));
    return encodeDescribe(vm, scope, helpers.encode, scope.manage(called.value), job, () => interrupted);
  } catch (error) {
    return classify(phase, interrupted, String(error));
  } finally {
    try {
      scope.dispose();
    } catch {}
  }
};

// packages/check/src/sandbox/worker.ts
var isRecord3 = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
var post = (message) => {
  parentPort?.postMessage(message);
};
var waitForGo = () => new Promise((resolve) => {
  if (!parentPort) {
    resolve();
    return;
  }
  parentPort.once("message", (message) => {
    if (isRecord3(message) && message["type"] === "go")
      resolve();
  });
});
var loadEngine = async () => {
  const bytes = new Uint8Array(await readFile(new URL("./quickjs.wasm", import.meta.url)));
  const digest = createHash("sha256").update(bytes).digest("hex");
  if (digest !== "105c3bed22d457e43e3d1c3c1c6959fda62a8fe06f0fc8a985303c3a2be72232")
    throw new Error("quickjs.wasm の SHA-256 が違う");
  return loadEngineFromBytes(bytes);
};
var main = async () => {
  const job = parseJob(workerData);
  if (!job) {
    post({ type: "report", outcome: "internal" });
    return;
  }
  let engine;
  try {
    engine = await loadEngine();
  } catch {
    post({ type: "report", outcome: "internal" });
    return;
  }
  post({ type: "ready" });
  await waitForGo();
  post({ type: "report", outcome: runGuest(job, engine) });
};
main();
