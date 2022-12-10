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