/**
 * @module EasySpeech
 * @typicalname EasySpeech
 */

/**
 * Cross browser Speech Synthesis with easy API.
 * This project was created, because it's always a struggle to get the synthesis
 * part of `Web Speech API` running on most major browsers.
 *
 * Setup is very straight forward (see example).
 *
 * @example
 * import EasySpeech from 'easy-speech'
 *
 * const example = async () => {
 *   await EasySpeech.init() // required
 *   await EasySpeech.speak({ 'Hello, world' })
 * }
 *
 * @see https://wicg.github.io/speech-api/#tts-section
 * @see https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
 * @type {Object}
 */
const EasySpeech = {}

/**
 * To support multiple environments (browser, node) we define scope, based
 * on what's available with window as priority, since Browsers are main target.
 * @private
 */
const scope = globalThis

/**
 * @private
 * @type {{
 *  status: String,
    initialized: Boolean,
    speechSynthesis: null|SpeechSynthesis,
    speechSynthesisUtterance: null|SpeechSynthesisUtterance,
    speechSynthesisVoice: null|SpeechSynthesisVoice,
    speechSynthesisEvent: null|SpeechSynthesisEvent,
    speechSynthesisErrorEvent: null|SpeechSynthesisErrorEvent,
    voices: null|Array<SpeechSynthesisVoice>,
    defaults: {
      pitch: Number,
      rate: Number,
      volume: Number,
      voice: null|SpeechSynthesisVoice
    },
    handlers: {}
 * }}
 */
const internal = {
  status: 'created'
}

const patches = {}

/*******************************************************************************
 *
 * AVAILABLE WITHOUT INIT
 *
 ******************************************************************************/

/**
 * Enable module-internal debugging by passing your own callback function.
 * Debug will automatically pass through all updates to `status`
 *
 * @example
 * import EasySpeech from 'easy-speech'
 * import Log from '/path/to/my/Log'
 *
 * EasySpeech.debug(arg => Log.debug('EasySpeech:', arg))
 *
 * @param {Function} fn A function, which always receives one argument, that
 *  represents a current debug message
 */
EasySpeech.debug = fn => {
  debug = typeof fn === 'function' ? fn : () => {}
}

let debug = () => {}

/**
 * Detects all possible occurrences of the main Web Speech API components
 * in the global scope.
 *
 * The returning object will have the following structure (see example).
 *
 * @example
 * EasySpeech.detect()
 *
 * {
 *     speechSynthesis: SpeechSynthesis|undefined,
 *     speechSynthesisUtterance: SpeechSynthesisUtterance|undefined,
 *     speechSynthesisVoice: SpeechSynthesisVoice|undefined,
 *     speechSynthesisEvent: SpeechSynthesisEvent|undefined,
 *     speechSynthesisErrorEvent: SpeechSynthesisErrorEvent|undefined,
 *     onvoiceschanged: Boolean,
 *     onboundary: Boolean,
 *     onend: Boolean,
 *     onerror: Boolean,
 *     onmark: Boolean,
 *     onpause: Boolean,
 *     onresume: Boolean,
 *     onstart: Boolean
 * }
 *
 * @returns {object} An object containing all possible features and their status
 */
EasySpeech.detect = () => detectFeatures()

/** @private **/
const detectFeatures = () => {
  const features = {}
  ;[
    'speechSynthesis',
    'speechSynthesisUtterance',
    'speechSynthesisVoice',
    'speechSynthesisEvent',
    'speechSynthesisErrorEvent'
  ].forEach(feature => {
    features[feature] = detect(feature)
  })

  features.onvoiceschanged = hasProperty(features.speechSynthesis, 'onvoiceschanged')

  const hasUtterance = hasProperty(features.speechSynthesisUtterance, 'prototype')

  utteranceEvents.forEach(event => {
    const name = `on${event}`
    features[name] = hasUtterance && hasProperty(features.speechSynthesisUtterance.prototype, name)
  })

  // not published to the outside
  patches.isAndroid = isAndroid()
  patches.isFirefox = isFirefox()
  patches.isSafari = isSafari()

  debug(`is android: ${!!patches.isAndroid}`)
  debug(`is firefox: ${!!patches.isFirefox}`)
  debug(`is safari: ${!!patches.isSafari}`)

  return features
}

/** @private **/
const hasProperty = (target = {}, prop) => Object.hasOwnProperty.call(target, prop) || prop in target || !!target[prop]

/** @private **/
const isAndroid = () => {
  const ua = (scope.navigator || {}).userAgent || ''
  return /android/i.test(ua)
}

/** @private **/
const isFirefox = () => typeof scope.InstallTrigger !== 'undefined'
const isSafari = () => typeof scope.GestureEvent !== 'undefined'

/**
 * Common prefixes for browsers that tend to implement their custom names for
 * certain parts of their API.
 * @private
 **/
const prefixes = ['webKit', 'moz', 'ms', 'o']

/**
 * Make the first character of a String uppercase
 * @private
 **/
const capital = s => `${s.charAt(0).toUpperCase()}${s.slice(1)}`

/**
 * Find a feature in global scope by checking for various combinations and
 * variations of the base-name
 * @param {String} baseName name of the component to look for, must begin with
 *   lowercase char
 * @return {Object|undefined} The component from global scope, if found
 * @private
 **/
const detect = baseName => {
  const capitalBaseName = capital(baseName)
  const baseNameWithPrefixes = prefixes.map(p => `${p}${capitalBaseName}`)
  const found = [baseName, capitalBaseName]
    .concat(baseNameWithPrefixes)
    .find(inGlobalScope)

  return scope[found]
}

/**
 * Returns, if a given name exists in global scope
 * @private
 * @param name
 * @return {boolean}
 */
const inGlobalScope = name => scope[name]

/**
 * Returns a shallow copy of the current internal status. Depending of the
 * current state this might return an object with only a single field `status`
 * or a complete Object, including detected features, `defaults`, `handlers`
 * and supported `voices`.
 *
 * @example
 * import EasySpeech from 'easy-speech'
 *
 * // uninitialized
 * EasySpeech.status() // { status: 'created' }
 *
 * // after EasySpeech.init
 * EasySpeech.status()
 *
 * {
 *   status: 'init: complete',
 *   initialized: true,
 *   speechSynthesis: speechSynthesis,
 *   speechSynthesisUtterance: SpeechSynthesisUtterance,
 *   speechSynthesisVoice: SpeechSynthesisVoice,
 *   speechSynthesisEvent: SpeechSynthesisEvent,
 *   speechSynthesisErrorEvent: SpeechSynthesisErrorEvent,
 *   voices: [...],
 *   defaults: {
 *     pitch: 1,
 *     rate: 1,
 *     volume: 1,
 *     voice: null
 *   },
 *   handlers: {}
 * }
 *
 * @return {Object} the internal status
 */
EasySpeech.status = () => ({ ...internal })

/**
 * Updates the internal status
 * @private
 * @param {String} s the current status to set
 */
const status = s => {
  debug(s)
  internal.status = s
}

/**
 * This is the function you need to run, before being able to speak.
 * It includes:
 * - feature detection
 * - feature assignment (into internal state)
 * - voices loading
 * - state update
 * - inform caller about success
 *
 * It will load voices by a variety of strategies:
 *
 * - detect and that SpeechSynthesis is basically supported, if not -> fail
 * - load voices directly
 * - if not loaded but `onvoiceschanged` is available: use `onvoiceschanged`
 * - if `onvoiceschanged` is not available: fallback to timeout
 * - if `onvoiceschanged` is fired but no voices available: fallback to timeout
 * - timeout reloads voices in a given `interval` until a `maxTimeout` is reached
 * - if voices are loaded until then -> complete
 * - if no voices found -> fail
 *
 * Note: if once initialized you can't re-init (will skip and resolve to
 * `false`) unless you run `EasySpeech.reset()`.
 *
 * @return {Promise<Boolean>}
 * @fulfil {Boolean} true, if initialized, false, if skipped (because already
 *   initialized)
 * @reject {Error} - The error `message` property will always begin with
 *   `EasySpeech: ` and contain one of the following:
 *
 *   - `browser misses features` - The browser will not be able to use speech
 *      synthesis at all as it misses crucial features
 *   - `browser has no voices (timeout)` - No voice could be loaded with neither
 *      of the given strategies; chances are high the browser does not have
 *      any voices embedded (example: Chromium on *buntu os')
 */

EasySpeech.init = function ({ maxTimeout = 5000, interval = 250 } = {}) {
  return new Promise((resolve, reject) => {
    if (internal.initialized) { return resolve(false) }
    EasySpeech.reset()
    status('init: start')

    // there may be the case, that the browser needs to load using a timer
    // so we declare it at the top to make sure the interval is always cleared
    // when we exit the Promise via fail / complete
    let timer
    let voicesChangedListener
    let completeCalled = false

    const fail = (errorMessage) => {
      status(`init: failed (${errorMessage})`)
      clearInterval(timer)
      internal.initialized = false
      return reject(new Error(`EasySpeech: ${errorMessage}`))
    }

    const complete = () => {
      // avoid race-conditions between listeners and timeout
      if (completeCalled) { return }
      status('init: complete')

      // set flags immediately
      completeCalled = true
      internal.initialized = true

      // cleanup events and timer
      clearInterval(timer)
      speechSynthesis.onvoiceschanged = null

      if (voicesChangedListener) {
        speechSynthesis.removeEventListener('voiceschanged', voicesChangedListener)
      }

      // all done
      return resolve(true)
    }

    // before initializing we force-detect all required browser features
    const features = detectFeatures()
    const hasAllFeatures = !!features.speechSynthesis && !!features.speechSynthesisUtterance

    if (!hasAllFeatures) {
      return fail('browser misses features')
    }

    // assign all detected features to our internal definitions
    Object.keys(features).forEach(feature => {
      internal[feature] = features[feature]
    })

    // start initializing
    const { speechSynthesis } = internal
    const voicesLoaded = () => {
      const voices = speechSynthesis.getVoices() || []
      if (voices.length > 0) {
        internal.voices = voices
        status(`voices loaded: ${voices.length}`)

        // if we find a default voice, set it as default
        internal.defaultVoice = voices.find(v => v.default)

        // otherwise let's stick to the first one we can find by locale
        if (!internal.defaultVoice) {
          const language = (scope.navigator || {}).language || ''
          const lang = language.split('-')[0]

          internal.defaultVoice = voices.find(v => {
            return v.lang && (v.lang.indexOf(`${lang}-`) > -1 || v.lang.indexOf(`${lang}_`) > -1)
          })
        }

        // otherwise let's use the first element in the array
        if (!internal.defaultVoice) {
          internal.defaultVoice = voices[0]
        }

        return true
      }
      return false
    }

    status('init: voices')

    // best case: detect if voices can be loaded directly
    if (voicesLoaded()) { return complete() }

    // last possible fallback method: run a timer until max. timeout and reload
    const loadViaTimeout = () => {
      status('init: voices (timer)')
      let timeout = 0
      timer = setInterval(() => {
        if (voicesLoaded()) {
          return complete()
        }

        if (timeout > maxTimeout) {
          return fail('browser has no voices (timeout)')
        }

        timeout += interval
      }, interval)
    }

    // detect if voices can be loaded after onveoiceschanged,
    // but only if the browser supports this event
    if (features.onvoiceschanged) {
      status('init: voices (onvoiceschanged)')

      speechSynthesis.onvoiceschanged = () => {
        if (voicesLoaded()) { return complete() }

        // xxx: some browsers (like chrome on android still have not all
        // voices loaded at this point, whichs is why we need to enter
        // the timeout-based method here.
        return loadViaTimeout()
      }

      // xxx: there is an edge-case where browser provide onvoiceschanged,
      // but they never load the voices, so init would never complete
      // in such case we need to fail after maxTimeout
      setTimeout(() => {
        if (voicesLoaded()) {
          return complete()
        }
        return fail('browser has no voices (timeout)')
      }, maxTimeout)
    } else {
      // this is a very problematic case, since we don't really know, whether
      // this event will fire at all, so we need to setup both a listener AND
      // run the timeout and make sure on of them "wins"
      // affected browsers may be: MacOS Safari
      if (hasProperty(speechSynthesis, 'addEventListener')) {
        status('init: voices (addEventListener)')

        voicesChangedListener = () => {
          if (voicesLoaded()) { return complete() }
        }

        speechSynthesis.addEventListener('voiceschanged', voicesChangedListener)
      }

      // for all browser not supporting onveoiceschanged we start a timer
      // until we reach a certain timeout and try to get the voices
      loadViaTimeout()
    }
  })
}

/**
 * Placed as first line in functions that require `EasySpeech.init` before they
 * can run.
 * @param {boolean=} force set to true to force-skip check
 * @private
 */
const ensureInit = ({ force } = {}) => {
  if (!force && !internal.initialized) {
    throw new Error('EasySpeech: not initialized. Run EasySpeech.init() first')
  }
}

/*******************************************************************************
 *
 * AVAILABLE ONLY AFTER INIT
 *
 ******************************************************************************/

/**
 * Returns all available voices.
 *
 * @condition `EasySpeech.init` must have been called and resolved to `true`
 * @return {Array<SpeechSynthesisVoice>}
 */
EasySpeech.voices = () => {
  ensureInit()
  return internal.voices
}

/**
 * Attaches global/default handlers to every utterance instance. The handlers
 * will run in parallel to any additional handlers, attached when calling
 * `EasySpeech.speak`
 *
 * @condition `EasySpeech.init` must have been called and resolved to `true`
 *
 * @param {Object} handlers
 * @param {function=} handlers.boundary - optional, event handler
 * @param {function=} handlers.end - optional, event handler
 * @param {function=} handlers.error - optional, event handler
 * @param {function=} handlers.mark - optional, event handler
 * @param {function=} handlers.pause - optional, event handler
 * @param {function=} handlers.resume - optional, event handler
 * @param {function=} handlers.start - optional, event handler
 *
 * @return {Object} a shallow copy of the Object, containing all global handlers
 */
EasySpeech.on = (handlers) => {
  ensureInit()

  utteranceEvents.forEach(name => {
    const handler = handlers[name]
    if (validate.handler(handler)) {
      internal.handlers[name] = handler
    }
  })

  return { ...internal.handlers }
}

/**
 * We use these keys to search for these events in handler objects and defaults
 * @private
 */
const utteranceEvents = [
  'boundary',
  'end',
  'error',
  'mark',
  'pause',
  'resume',
  'start'
]

/**
 * Internal validation of passed parameters
 * @private
 */
const validate = {
  isNumber: n => typeof n === 'number' && !Number.isNaN(n),
  pitch: p => validate.isNumber(p) && p >= 0 && p <= 2,
  volume: v => validate.isNumber(v) && v >= 0 && v <= 1,
  rate: r => validate.isNumber(r) && r >= 0.1 && r <= 10,
  text: t => typeof t === 'string',
  handler: h => typeof h === 'function',
  // we prefer duck typing here, mostly because there are cases where
  // SpeechSynthesisVoice is not defined on global scope but is supported
  // when using getVoices().
  voice: v => v && v.lang && v.name && v.voiceURI
}

/**
 * Sets defaults for utterances. Invalid values will be ignored without error
 * or warning.
 *
 * @see https://wicg.github.io/speech-api/#utterance-attributes
 * @param {object=} options - Optional object containing values to set values
 * @param {object=} options.voice - Optional `SpeechSynthesisVoice` instance or
 *  `SpeechSynthesisVoice`-like Object
 * @param {number=} options.pitch - Optional pitch value >= 0 and <= 2
 * @param {number=} options.rate - Optional rate value >= 0.1 and <= 10
 * @param {number=} options.volume - Optional volume value >= 0 and <= 1
 *
 * @return {object} a shallow copy of the current defaults
 */
EasySpeech.defaults = (options) => {
  ensureInit()

  if (options) {
    internal.defaults = internal.defaults || {}

    ;['voice', 'pitch', 'rate', 'volume'].forEach(name => {
      const value = options[name]
      const isValid = validate[name]

      if (isValid(value)) {
        internal.defaults[name] = value
      }
    })
  }

  return { ...internal.defaults }
}

/**
 * Determines the current voice and makes sure, there is always a voice returned
 * @private
 * @param voice
 * @return {*|SpeechSynthesisVoice|{}}
 */
const getCurrentVoice = voice => voice ||
  internal.defaults?.voice ||
  internal.defaultVoice ||
  internal.voices?.[0]

/**
 * Creates a new `SpeechSynthesisUtterance` instance
 * @private
 * @param text
 */
const createUtterance = text => {
  const UtteranceClass = internal.speechSynthesisUtterance
  return new UtteranceClass(text)
}

/**
 * Speaks a voice by given parameters, constructs utterance by best possible
 * combinations of parameters and defaults.
 *
 * If the given utterance parameters are missing or invalid, defaults will be
 * used as fallback.
 *
 * @example
 * const voice = EasySpeech.voices()[10] // get a voice you like
 *
 * EasySpeech.speak({
 *   text: 'Hello, world',
 *   voice: voice,
 *   pitch: 1.2,  // a little bit higher
 *   rate: 1.7, // a little bit faster
 *   boundary: event => console.debug('word boundary reached', event.charIndex),
 *   error: e => notify(e)
 * })
 *
 * @param {object} options - required options
 * @param {string} text - required text to speak
 * @param {object=} voice - optional `SpeechSynthesisVoice` instance or
 *   structural similar object (if `SpeechSynthesisUtterance` is not supported)
 * @param {number=} options.pitch - Optional pitch value >= 0 and <= 2
 * @param {number=} options.rate - Optional rate value >= 0.1 and <= 10
 * @param {number=} options.volume - Optional volume value >= 0 and <= 1
 * @param {boolean=} options.force - Optional set to true to force speaking, no matter the internal state
 * @param {object=} handlers - optional additional local handlers, can be
 *   directly added as top-level properties of the options
 * @param {function=} handlers.boundary - optional, event handler
 * @param {function=} handlers.end - optional, event handler
 * @param {function=} handlers.error - optional, event handler
 * @param {function=} handlers.mark - optional, event handler
 * @param {function=} handlers.pause - optional, event handler
 * @param {function=} handlers.resume - optional, event handler
 * @param {function=} handlers.start - optional, event handler
 *
 *
 * @return {Promise<SpeechSynthesisEvent|SpeechSynthesisErrorEvent>}
 * @fulfill {SpeechSynthesisEvent} Resolves to the `end` event
 * @reject {SpeechSynthesisEvent} rejects using the `error` event
 */
EasySpeech.speak = ({ text, voice, pitch, rate, volume, force, ...handlers }) => {
  ensureInit({ force })

  if (!validate.text(text)) {
    throw new Error('EasySpeech: at least some valid text is required to speak')
  }

  const getValue = options => {
    const [name, value] = Object.entries(options)[0]

    if (validate[name](value)) {
      return value
    }

    return internal.defaults?.[name]
  }

  return new Promise((resolve, reject) => {
    status('init speak')

    const utterance = createUtterance(text)
    const currentVoice = getCurrentVoice(voice)

    // XXX: if we force-speak, we may not get a current voice!
    // This may occur when the browser won't load voices but
    // provides SpeechSynth and SpeechSynthUtterance.
    // We then might at least try to speak something with defaults
    if (currentVoice) {
      utterance.voice = currentVoice
      utterance.lang = currentVoice.lang
      utterance.voiceURI = currentVoice.voiceURI
    }

    utterance.text = text
    utterance.pitch = getValue({ pitch })
    utterance.rate = getValue({ rate })
    utterance.volume = getValue({ volume })
    debugUtterance(utterance)

    utteranceEvents.forEach(name => {
      const fn = handlers[name]

      if (validate.handler(fn)) {
        utterance.addEventListener(name, fn)
      }

      if (internal.handlers?.[name]) {
        utterance.addEventListener(name, internal.handlers[name])
      }
    })

    // always attached are start, end and error listeners

    // XXX: chrome won't play longer tts texts in one piece and stops after a few
    // words. We need to add an intervall here in order prevent this. See:
    // https://stackoverflow.com/questions/21947730/chrome-speech-synthesis-with-longer-texts
    //
    // XXX: this apparently works only on chrome desktop, while it breaks chrome
    // mobile (android), so we need to detect chrome desktop
    //
    // XXX: resumeInfinity breaks on firefox macOs so we need to avoid it there
    // as well. Since we don't need it in FF anyway, we can safely skip there
    //
    // XXX: resumeInfinity is also incompatible with older safari ios versions
    // so we skip it on safari, too.
    utterance.addEventListener('start', () => {
      patches.paused = false
      patches.speaking = true

      if (!patches.isFirefox && !patches.isSafari && patches.isAndroid !== true) {
        resumeInfinity(utterance)
      }
    })

    utterance.addEventListener('end', endEvent => {
      status('speak complete')
      patches.paused = false
      patches.speaking = false
      clearTimeout(timeoutResumeInfinity)
      resolve(endEvent)
    })

    utterance.addEventListener('error', (errorEvent = {}) => {
      status(`speak failed: ${errorEvent.message}`)
      patches.paused = false
      patches.speaking = false
      clearTimeout(timeoutResumeInfinity)
      reject(errorEvent)
    })

    // make sure we have no mem-leak
    clearTimeout(timeoutResumeInfinity)
    internal.speechSynthesis.cancel()

    setTimeout(() => {
      internal.speechSynthesis.speak(utterance)
    }, 10)
  })
}

/** @private **/
const debugUtterance = ({ voice, pitch, rate, volume }) => {
  debug(`utterance: voice=${voice?.name} volume=${volume} rate=${rate} pitch=${pitch}`)
}

/**
 * Timer variable to clear interval
 * @private
 */
let timeoutResumeInfinity

/**
 * Fixes long texts in some browsers
 * @private
 * @param target
 */
function resumeInfinity (target) {
  // prevent memory-leak in case utterance is deleted, while this is ongoing
  if (!target && timeoutResumeInfinity) {
    debug('force-clear timeout')
    return scope.clearTimeout(timeoutResumeInfinity)
  }

  // only execute on speaking utterances, otherwise paused
  // utterances will get resumed, thus breaking user experience
  // include internal patching, since some systems have problems with
  // pause/resume and updateing the internal state on speechSynthesis
  const { paused, speaking } = internal.speechSynthesis
  const isSpeaking = speaking || patches.speaking
  const isPaused = paused || patches.paused
  debug(`resumeInfinity isSpeaking=${isSpeaking} isPaused=${isPaused}`)

  if (isSpeaking && !isPaused) {
    internal.speechSynthesis.pause()
    internal.speechSynthesis.resume()
  }
  timeoutResumeInfinity = scope.setTimeout(function () {
    resumeInfinity(target)
  }, 5000)
}

/**
 * Cancels the current speaking, if any running
 */
EasySpeech.cancel = () => {
  ensureInit()
  status('cancelling')
  internal.speechSynthesis.cancel()
  patches.paused = false
  patches.speaking = false
}

/**
 * Resumes to speak, if any paused
 */
EasySpeech.resume = () => {
  ensureInit()
  status('resuming')

  patches.paused = false
  patches.speaking = true
  internal.speechSynthesis.resume()
}

/**
 * Pauses the current speaking, if any running
 */
EasySpeech.pause = () => {
  ensureInit()
  status('pausing')

  // exec pause on Android causes speech to end but not to fire end-event
  // se we simply do it manually instead of pausing
  if (patches.isAndroid) {
    debug('patch pause on Android with cancel')
    return internal.speechSynthesis.cancel()
  }

  internal.speechSynthesis.pause()
  // in some cases, pause does not update the internal state,
  // so we need to update it manually using an own state
  patches.paused = true
  patches.speaking = false
}

/**
 * Resets the internal state to a default-uninitialized state
 */
EasySpeech.reset = () => {
  Object.assign(internal, {
    status: 'reset',
    initialized: false,
    speechSynthesis: null,
    speechSynthesisUtterance: null,
    speechSynthesisVoice: null,
    speechSynthesisEvent: null,
    speechSynthesisErrorEvent: null,
    voices: null,
    defaultVoice: null,
    defaults: {
      pitch: 1,
      rate: 1,
      volume: 1,
      voice: null
    },
    handlers: {}
  })
}

/**
 * EasySpeech is the default export; you can import it with whichever name you
 * like
 *
 * @example
 * import EasySpeech from 'easy-speech'
 * @example
 * import Easy from 'easy-speech'
 */
export default EasySpeech
