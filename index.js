// method to create element
const createElement = (name, selector, parent) => {
    // create element by name
    const element = document.createElement(name)
    // set class name
    if(selector) { element.className = selector }
    // append to parent
    if(parent) { parent.appendChild(element) }
    // return element
    return element
}

// mehod to create element next to parent
const createElementNextTo = (name, selector, sibling) => {
    // create element
    const element = createElement(name, selector)
    // get parent node
    const parent = sibling.parentNode
    // append next to sibling
    parent.insertBefore(element, sibling.nextSibling)
    // return element
    return element
}

// current file location
const path = location.toString()

// create markdown uuid
const uuid = sessionStorage[path]
    ? sessionStorage[path]
    : sessionStorage[path] = Date.now() + Math.floor(Date.now() * Math.random()).toString()

// editor object
const editor = {
    // container elements
    txt : document.querySelector('.editor > textarea'),
    pre : document.querySelector('.editor > pre')
}

// viewer object
const viewer = {
    // container elements
    div : document.querySelector('.viewer > .document')
}

// options object
const options = {
    div : {
        // container elements
        main : document.querySelector('.options'),
        open : document.querySelector('.ob-open'),
        save : document.querySelector('.ob-save'),
        play : document.querySelector('.ob-play'),
        conf : document.querySelector('.ob-conf')
    }
}

// method to update editor
editor.updateContent = (text = null) => {
    // select text from input or textarea
    const data = typeof text === 'string'
        ? editor.txt.value = text
        : editor.txt.value
    // language
    const lang = 'markdown'
    // prism parser for markdown
    const html = Prism.highlight(data, Prism.languages[lang], lang)
    // set on pre element
    editor.pre.innerHTML = html
    // update scroll position
    editor.updateScroll()
}

// method to update scroll position
editor.updateScroll = () => {
    // update pre element scroll position
    editor.pre.scrollTop = editor.txt.scrollTop
}

// method to set busy on button
editor.setBusy = button => {
    // set busy for option tray
    options.div.main.classList.add('busy')
    // remove done from button
    button.classList.remove('done')
    // set busy for button
    button.classList.add('busy')
}

// method to set done on button
editor.setDone = (button, time_1 = 0, time_2 = 300) => {
    // delay with time
    setTimeout(() => {
        // remove busy from button
        button.classList.remove('busy')
        // add done class
        button.classList.add('done')
        // remove busy from option tray
        options.div.main.classList.remove('busy')
        // delay with time
        setTimeout(() => {
            // remove done class
            button.classList.remove('done')
        }, time_2)
    }, time_1)
}

// update content on textarea with events
editor.txt.addEventListener('input', editor.updateContent)
editor.txt.addEventListener('scroll', editor.updateScroll)
editor.txt.addEventListener('change', editor.updateScroll)

// method to update viewer
viewer.updateContent = () => {
    // set busy for play button
    editor.setBusy(options.div.play)
    // fade document
    viewer.div.classList.add('fade')
    // save on local storage
    localStorage['codebook_temp'] = editor.txt.value
    // parser markdown text
    parserMarkdown(editor.txt.value)
    // remove busy from play button
    editor.setDone(options.div.play, 300)
    // delay and unfade document
    setTimeout(() => viewer.div.classList.remove('fade'), 300)
}

// read file on open button click
options.div.open.addEventListener('click', () => {
    // set busy for open button
    editor.setBusy(options.div.open)
    // file opener with options
    showOpenFilePicker({
        types : [
            {
                description : 'Markdown Files',
                accept : {
                    'text/*' : ['.md', '.txt']
                }
            }
        ]
    }).then(results => {
        // get first file
        results[0].getFile().then(file => {
            // create file reader
            const reader = new FileReader()
            // on file read complete
            reader.addEventListener('load', event => {
                // update editor content
                editor.updateContent(event.target.result)
                // update viewer content
                viewer.updateContent()
                // set file name on local storage
                localStorage['bodebook_name'] = file.name
                // set done flag for open button
                editor.setDone(options.div.open)
            })
            // on file read error
            reader.addEventListener('error', () => {
                // set done flag for open button
                editor.setDone(options.div.open)
            })
            // read file as text
            reader.readAsText(file)
        }).catch(() => {
            // set done flag for open button
            editor.setDone(options.div.open)
        })
    }).catch(() => {
        // set done flag for open button
        editor.setDone(options.div.open)
    })
})

// save file on save button click
options.div.save.addEventListener('click', () => {
    // update viewer
    viewer.updateContent()
    // get file data
    const data = encodeURIComponent(editor.txt.value)
    // get file name
    const name = localStorage['codebook_name'] || 'untitled.md'
    // create element
    const elem = document.createElement('a')
    // set file content
    elem.setAttribute('href', 'data:text/plain;charset=utf-8,' + data)
    // set file name
    elem.setAttribute('download', name)
    // click element
    elem.click()
})

// update content on play button click
options.div.play.addEventListener('click', viewer.updateContent)

// classes for each query selector
const classes = {
    'code-block' : "pre[lang]",
    'code-block-inner' : "pre > code",
    'inline-code' : "p > code, li > code"
}

// method to parser markdown
const parserMarkdown = (text = '') => {
    // get html content
    const html = '<root>' + marked(text) + '</root>'
    // put content to body
    viewer.div.innerHTML = html
    // get all code segments
    const pres = viewer.div.querySelectorAll('pre > code[class^="language-"]')
    // for each code element
    for(let i = 0; i < pres.length; i++) {
        // current code element
        const elem = pres[i]
        // get language data
        const data = /language-(.*)/g.exec(elem.className)
        // get language
        const lang = data ? data[1].toLowerCase() : 'plain'
        // set language on parent element
        elem.parentElement.setAttribute('lang', lang)
        // create tray element
        const tray = createElement('div', 'code-block-tray', elem.parentElement)
        // create copy element inside tray
        createElement('div', 'code-block-copy', tray)
        // check for language availability
        if(compiler.languages.includes(lang)) {
            // create exec element inside tray
            createElement('div', 'code-block-exec', tray)
        }
        // create output container
        const outs = createElementNextTo('div', 'code-block-outs', elem.parentElement)
        // create exit button
        createElement('div', 'code-block-exit', outs)
        // create logs element
        createElement('div', 'code-block-logs', outs)
        // create info label
        createElement('div', 'code-block-info', outs)
        // check language with prism
        if(Prism.languages[lang]) {
            // get code text
            const code = elem.innerText
            // get prism content
            const prsm = Prism.highlight(code, Prism.languages[lang], lang)
            // set content on element
            elem.innerHTML = prsm
        }
    }
    // get classes keys
    const keys = Object.keys(classes)
    // for each class
    for(let i = 0; i < keys.length; i++) {
        // current classs name
        const name = keys[i]
        // get all elements
        const earr = viewer.div.querySelectorAll(classes[name])
        // for each element
        for(let e = 0; e < earr.length; e++) {
            earr[e].className = name
        }
    }
}

// on window click
window.addEventListener('click', event => {
    // get element
    const elem = event.target
    // check for inline code element
    if(elem.classList.contains('inline-code')) {
        // set clipboard text
        navigator.clipboard.writeText(elem.innerText).then(() => {
            // set copied class
            elem.classList.add('copied')
            // delay and remove copied class
            setTimeout(() => elem.classList.remove('copied'), 800)
        })
    } else if(elem.classList.contains('code-block-copy')) {
        // get code segment element
        const code = elem.parentElement.parentElement
        // set clipboard text
        navigator.clipboard.writeText(code.innerText).then(() => {
            // set active class
            code.classList.add('active')
            // set copied class
            elem.classList.add('copied')
            // delay and remove classes
            setTimeout(() => {
                // remove active class
                code.classList.remove('active')
                // remove copied class
                elem.classList.remove('copied')
            }, 800)
        })
    } else if(elem.classList.contains('code-block-exec')) {
        // get code segment element
        const code = elem.parentElement.parentElement
        // get code text
        const text = code.innerText
        // get language
        const lang = code.getAttribute('lang')
        executeCodeSegment(text, lang, code)
    } else if(elem.classList.contains('code-block-exit')) {
        // hide parent outs element
        elem.parentElement.style.display = 'none'
    }
})

// compiler object
const compiler = {
    languages : [ 'js', 'javascript' ],
    busy : false
}

// method to execute code segments
const executeCodeSegment = async(code, lang, elem) => {
    // get exec element
    const exec = elem.querySelector('.code-block-exec')
    // get outs element
    const outs = elem.nextElementSibling
    // get logs element
    const logs = outs.querySelector('.code-block-logs')
    // get info element
    const info = outs.querySelector('.code-block-info')
    // set busy flag
    compiler.busy = true
    // add running class
    exec.classList.add('running')
    // add active class
    elem.classList.add('active')
    // get result data by language
    const data = lang === 'js' || lang === 'javascript'
        // execute on frontend
        ? await executeFrontend(code, lang)
        // execute on backend
        : await executeBakcend(code, lang)
    // update busy flag
    compiler.busy = false
    // unhide output container
    outs.style.display = 'block'
    // add active for output
    outs.classList.add('active')
    // set output on logs
    logs.innerHTML = data.output
    // set output info
    info.innerHTML = data.time + ' seconds <span>' + data.compiler + '</span>'
    // delay to remove classes
    setTimeout(() => {
        // remove copied class
        exec.classList.remove('running')
        // remove active class
        elem.classList.remove('active')
        // remove active for output
        outs.classList.remove('active')
    }, 800)
}

// method to execute frontend segment
const executeFrontend = async(text) => {
    // create text with bypass commands
    const code = frontendbypass.replace('#text', text)
    // result object
    const data = { output : [], time : 0, compiler : 'Front-End' }
    // mark start time
    const time_a = performance.now()
    // try for execution
    try {
        // store output
        data.output = Function(code)()
    } catch(e) {
        // push if any error
        data.output.push({ type : 'error', data : [e.message, 1] })
    }
    // map output to multiline string
    data.output = data.output.map(x => {
        // map each argument
        return x.data.map(x => {
            // convert stringify objects if need
            return typeof x === 'object' ? JSON.stringify(x) : x
        }).join(' ')
    }).join('\n')
    // mark end time
    const time_b = performance.now()
    // set runtime
    data.time = ((time_b - time_a) / 1000).toFixed(4)
    // return result
    return data
}

// method to execute backend segment
const executeBakcend = async(text, lang) => {
    // request compiler build
    const data = await fetch('/codebook/compilers/build.php', {
        // request method
        method : 'POST',
        // request body
        body : JSON.stringify({
            // markdown uuid
            uuid : uuid,
            // code language
            lang : lang,
            // code segment
            code : text
        })
    }).then(x => x.json())
    // get output
    const output = data.output.data.replace(/\</g, '&lt;')
    // get runtime
    const time = data.output.time.toFixed(4)
    // return results
    return { output, time, compiler : data.compiler.name + ' ' + data.compiler.version }
}

// bypass for frontend executions
const frontendbypass = `
    const _cb_lg_arr_ = []
    const console = {}
    console.log = function(...a) { _cb_lg_arr_.push({ type : 'log', data : a }) }
    console.error = function(...a) { _cb_lg_arr_.push({ type : 'error', data : a }) }
    console.warn = function(...a) { _cb_lg_arr_.push({ type : 'warn', data : a }) }

    try {
        #text
    } catch(err) {
        console.error(err.message)
    }

    return _cb_lg_arr_
`

window.addEventListener('load', async() => {
    // get backend compilers data
    const comp = await fetch('index.json').then(x => x.json())
    // for each compiler
    Object.values(comp).forEach(item => {
        // for each language in compiler
        item.languages.forEach(lang => {
            // include in languages
            compiler.languages = compiler.languages.concat(lang.code)
        })
    })
    // check local storage
    const data = localStorage.getItem('codebook_temp')
    // check content
    if(data) {
        // update editor
        editor.updateContent(data)
        // update viewer
        viewer.updateContent()
    }
    // set textarea placeholder
    editor.txt.setAttribute('placeholder', "Type something new...")
})

// on key down
window.addEventListener('keydown', event => {
    // check key name
    if(event.key === 'F5') {
        // update viewer
        viewer.updateContent()
        // prevent event
        event.preventDefault()
    }
})