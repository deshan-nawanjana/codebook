const CodeBook = {}

CodeBook.syntax = {
    code_block : {
        exec : text => /```([^`]*)\n```/s.exec(text),
        data : data => ({
            text : data[1].substring(data[1].indexOf('\n') + 1),
            lang : data[1].split('\n')[0].toLowerCase()
        }),
        html : data => {
            const lang = Prism.languages[data.lang] || Prism.languages.plain
            const code = Prism.highlight(data.text, lang, data.lang)
            return `<pre lang="${data.lang}">${code}</pre>`
        }
    },
    inline_code : {
        exec : text => /(`+)([^`]*)(`+)/g.exec(text),
        data : data => ({ text : data[2] }),
        html : data => `<code>${data.text}</code>`
    },
    config : {
        exec : text => /<!--[^>]*-->/g.exec(text),
        data : data => ({ text : data[0] }),
        html : data => data.text
    },
    blod_italic_text : {
        exec : text => /(\*\*\*)(\S+)(\*\*\*)/g.exec(text),
        data : data => ({ text : data[2] }),
        html : data => `<b><i>${data.text}</i></b>`
    },
    blod_text : {
        exec : text => /(\*\*)(\S+)(\*\*)/g.exec(text),
        data : data => ({ text : data[2] }),
        html : data => `<b>${data.text}</b>`
    },
    italic_text : {
        exec : text => /(\*)(\S+)(\*)/g.exec(text),
        data : data => ({ text : data[2] }),
        html : data => `<i>${data.text}</i>`
    },
    link_text : {
        exec : text => /(\[.*\])(\(.*\))/g.exec(text),
        data : data => ({
            text : data[1].substring(1, data[1].length - 1),
            href : data[2].substring(1, data[2].length - 1)
        }),
        html : data => `<a href="${data.href}" target="blank">${data.text}</a>`
    },
    link : {
        exec : text => /http(.?)(:\/\/)(\S+)/g.exec(text),
        data : data => ({ href : data[0] }),
        html : data => `<a href="${data.href}" target="blank">${data.href}</a>`
    },
    heading : {
        exec : text => /(#+\s)(.*)/g.exec(text),
        data : data => ({ text : data[2], size : data[1].length - 1 }),
        html : data => `<h${data.size}>${data.text}</h${data.size}>`
    },
    list : {
        exec : text => /\* (.*)/g.exec(text),
        data : data => ({ text : data[1] }),
        html : data => `<li>${data.text}</li>`
    },
    indent : {
        exec : text => /\n( +\s)(.*)/g.exec(text),
        data : data => {
            return ({ text : data[2], size : Math.ceil(data[1].length / 4) })
        },
        html : data => {
            const a = '<blockquote>'.repeat(data.size)
            const b = '</blockquote>'.repeat(data.size)
            return a + data.text + b
        }
    },
    break : {
        exec : text => /\n\n(\n+)/g.exec(text),
        data : data => ({ size : data[0].length - 1 }),
        html : data => '<br>'.repeat(data.size)
    }
}

// method to get all syntaxes
CodeBook.parse = (input = '') => {
    // replace newline format
    input = input.replace(/\r\n/g, '\n')
    // replace tab sapces
    input = input.replace(/\t/g, '    ')
    // output array
    const array = []
    // syntax types array
    const types = Object.keys(CodeBook.syntax)
    // for each syntax type
    for(let i = 0; i < types.length; i++) {
        // current syntax type
        const type = types[i]
        // current syntax
        const sytx = CodeBook.syntax[type]
        // status object
        const stat = { match : sytx.exec(input) }
        // while match available
        while(stat.match) {
            // get matched part
            const part = stat.match[0]
            // replace part with marker
            input = input.replace(part, `{!_cb::${type}::${array.length}}`)
            // get matched data
            const data = sytx.data(stat.match)
            // push to output
            array.push({ type : type, data : data, part : part })
            // assign next match to status
            stat.match = sytx.exec(input)
        }
    }
    // split into sections
    const sects = input.split('\n\n').map(item => {
        // check content
        if(item.indexOf('{!_cb') !== 0) {
            // add devisions for plain text
            return '<div>' + item + '</div>'
        } else if(item.includes('<!--' && '-->')) {

        } else {
            // return same item
            return item
        }
    })
    // combine sections by devisions
    input = sects.map(item => {
        if(item.includes('{!_cb::config')) {
            return '<div class="config">' + item + '</div>'
        } else {
            return '<div>' + item + '</div>'
        }
    }).join('')
    // while cb node available
    while(/{!_cb::([^}]*)::([0-9]+)}/g.test(input)) {
        // get matched data
        const data = /{!_cb::([^}]*)::([0-9]+)}/g.exec(input)
        // get array item
        const item = array[parseInt(data[2])]
        // replace with array item data
        input = input.replace(data[0], CodeBook.syntax[item.type].html(item.data))
    }
    // create root element
    const root = document.createElement('root')
    // set inner content
    root.innerHTML = input
    // get all code elements
    const code = root.querySelectorAll('code')
    // for each code element
    for(let i = 0; i < code.length; i++) {
        // current element
        const elem = code[i]
        // on click
        elem.addEventListener('click', () => {
            // set clipboard text
            navigator.clipboard.writeText(elem.innerText).then(() => {
                // add copied class
                elem.classList.add('copied')
                // delay and remove copied class
                setTimeout(() => elem.classList.remove('copied'), 500)
            })
        })
    }
    // get all config elements
    const conf = root.querySelectorAll('.config')
    // for each config element
    for(let i = 0; i < conf.length; i++) {
        // current element
        const elem = conf[i]
        // element text
        let text = elem.innerHTML
        // check script segments
        while(/:script\({(.*)}\)/s.test(text)) {
            // get matched data
            const data = /:script\({(.*)}\)/s.exec(text)
            // execute script
            Function(data[1])()
            // remove segment
            text = text.replace(data[0], '')
        }
        // check style segments
        while(/:style\({(.*)}\)/s.test(text)) {
            // get matched data
            const data = /:style\({(.*)}\)/s.exec(text)
            // create style element
            const elem = document.createElement('style')
            // set styles
            elem.innerHTML = data[1]
            // append to root element
            root.appendChild(elem)
            // remove segment
            text = text.replace(data[0], '')
        }
    }
    // return outputs
    return { array : array, root : root }
}