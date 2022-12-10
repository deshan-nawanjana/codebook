# Welcome to CodeBook Markdown Compiler

**CodeBook** is a web application that you can create `interactive` and `compilable` markdown files within few munites. CodeBook is already setup for following programming languages to start coding. Only thing you have to do is setup CodeBook inside a local server in your computer and include all the compiler binaries in to the backend.

- Java
- Python
- C
- C++
- Ruby
- R
- Julia
- Pascal
- Fortran

```js
// array of words
const words = ["CodeBook", "Markdown", "Compiler"]
// join all items with spaces
const output = words.join(" ")
// click run button to see the output
return output
```

Also you can use JavaScript anywhere with no help of backend. You can continue to the instructions for local server setup. Before that, let's see what are the main features that come with CodeBook for you!

## 📝 Markdown Editor & Parser
Left side of this interface contains the markdown coding for the document. And the preview of the markdown is in the right side. You can edit the makrdown code and press `build button` to update the preview. Build button is the third options in the button box of the editor.

## 💾 Browser Storage

Everytime you hit the build button, copy of your markdown will be saved in your browser storage. Even if you refresh or accidentally close the browser will never effect to your work. The previous markdown coding will be there when you come back here.

## 📁 Open, Save and Export

Click the `open button` and select a markdown file from your computer to load into CodeBook. After editing, you can press the `save button` and download your updated markdown file. The `awesome part` is you can export the preview as an HTML document and it's also `interactive` with some features!

## 🖥️ Quick Copy Feature

You can click on any `highlighted text` to copy the content inside it. Also move your cursor inside to code block and you may see the copy button there. This feature is available for the exported HTML files as well.

```js
/*
   This is a code block.
   Move your cursor here to see the copy button.
   It will be appeared on the upper right corner
*/
```

## 🚀 Run Codes with Compilers

Within the code blocks, you may see a `compile button` to run the script and get the output. This button only appears when CodeBook has ability to compile using that particular language. Following script is in JavaScript language. So there will be no problem to run this block anywhere. Go ahead and click the run button.

```js
// create constant text
const text = "Hello, World!"

// create function
const print = function() {
    // print text 5 times
    for(let i = 0; i < 5; i++) {
        console.log(text)
    }
}

// call the fucntion
print()
```

Any other compiler that required a server-side compilation will be available for local server. You find the `index.json` file in the root folder and see the setup and details for those compilers. Just download them and copy them into `binary folder` in the application.

### Java

```java
class HelloWorld {
     public static void main(String[] args) {
          System.out.println("Hello, World!"); 
     }
}
```

### Python

```py
print('Hello, world!')
```

### C

```c
#include <stdio.h>

void main() {
    printf("Hello, World!");
}
```

### C++

```cpp
#include <iostream>

int main() {
    std::cout << "Hello, World!";
    return 0;
}
```

### Ruby

```ruby
puts "Hello, World!"
```

### Julia

```julia
print("Hello, World!")
```

### R

```r
sayHello <- function(){
   print('Hello, World!')
}

sayHello()
```

### Pascal

```pascal
program Hello;
begin
    writeln('Hello, World!')
end.
```

### Fortran

```fortran
program hello
    print *,"Hello World!"
end program
```

## 🔮 Setup You Local Server for CodeBook

- Download the `CodeBook Project` source from following github repository.
    - https://github.com/deshan-nawanjana/codebook

- Install `WampServer`, `XAMPP`, `Laragon` or any other hosting application that supports PHP.

- Copy CodeBook source files into www directory or anywhere inside. And create following two new folders `binary` and `cache` inside `compilers` folder.

```plain
compilers
 ├── binary
 └── cache
```

- Download compilers for their official websites. Those links are available inside [index.json](./index.json) of the CodeBook root folder. Let's see how it looks after you include all the compilers into CodeBook backend.

```plain
compilers
 ├── binary
 │    ├── jdk
 │    ├── julia
 │    ├── mingw
 │    ├── python
 │    ├── r
 │    └── ruby
 └── cache
```

- Make sure all of you `compiler paths` as setup correctly according to your binary file locations.

#### That's it! Now you can create interactive and executable markdown files using CodeBook anytime!