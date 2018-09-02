# GM

一个公共的html代码模板工具。可以借助模板引擎，将一些变动的元素以json数据的形式加以抽象，然后渲染到模板中，生成目标文件。让模板成为真正的模板。

## Getting Started

使用gm需要现在全局安装npm包

### 环境基础

1.需要node环境，参考[Installing Node.js via package manager](https://nodejs.org/en/download/package-manager/)  

2.安装gm

```
npm install -g gm       # or [url of this repository]

```

### 开发指南

资源结构（举例）

```
├── demo3.html              #主要html源文件，文件名，通过gm.json配置。
├── demo3.json              #主要json源文件，文件名，通过gm.json配置。
├── gm.html                 #由gm生成的html，默认目标生成文件
├── gm.json                 #gm.json是读取配置的入口文件，每个包下都必须有
└── gm_components           #gm安装的依赖模板包
    ├── demo1@V1.0.0
    │   ├── demo1.html
    │   ├── demo1.json
    │   └── gm.json
    └── demo2@V1.0.0
        ├── demo2.html
        ├── demo2.json
        └── gm.json

```

##架构解释

* 资源至少包含gm.json，以及配置的html/json两个文件

```
demo3@V1.0.0
├── demo3.html
├── demo3.json
└── gm.json
```

* gm.json

主体框架下，gm.json会配置源文件的文件名称（不带后缀），以及依赖关系。

```
{
  "name": "demo3",              #project name && gm publish name
  "main": "demo3",              #main source file
  "output": "gm.html",          #target file for building, 'gm.html' as defult
  "dependencies": {             #the templates that used in this project
    "demo1": "@1.0.0",
    "demo2": "@1.0.0"
  }
}
```

* demo3.html

partOne，partTwo，partThree都是html文本。采用<%-%>，语法参考 [ejs](https://github.com/tj/ejs)

```
<div id="demo3">
  <div class="part1">
    <%-partOne%>
  </div>
  <div class="part2">
    <%-partTwo%>
  </div>
  <div class="part3">
    <%-partThree%>
  </div>
</div>
```

demo3.json

```
{
    "partOne": {
        "template": "demo2@V1.0.0"
    },
    "partTwo": {
        "template": "demo2@V1.0.0",
        "data": {
            "content1": {
                "template": "demo1@V1.0.0",
                "data": {
                    "placeholder": "hello by demo3"
                }
            },
            "listContent": ["text1", {
                "template": "demo1@V1.0.0",
                "data": {
                    "placeholder": "hello by demo3"
                }
            }, "text3"]
        }
    },
    "partThree": "第三部分"
}
```

##template语法

* 如果是一般数据，会直接渲染到html。
* 如果是依赖于template生成,则数据结构可以是：

```
{
    "template": "demo1@V1.0.0",
    "data": {
        "placeholder": "hello by demo3"
    }
}
```

模板 demo1\@V1.0.0 如下：

```
//demo1.html
<input type="text" placeholder="<%-placeholder%>" />

//demo1.json
{
    "placeholder": "请输入文本"
}
```

其中，`template` 和 `data` 是固定的属性。  
 ***template*** 由包名和版本号组成。固定格式引用。   
 ***data*** 填充该template的json数据，会覆盖模板的默认数据。可以为空，为空则用默认数据。

##指令

```
Usage: gm [options]

Gm help.


 Options:
  -d, --directory[=DIR]       The directory to be builded, default is current
                                directory
  -o, --output[=PATH]         Write the builded content to the target file
  -a, --append-array          Appends intead of replaces an array
  -b, --build                 Compile && build file
  -i, --install[=MODULES]     Install templates
  -V, --verbose               Makes output more verbose
  -h, --help                  Display this help message and exit
  -v, --version               Output version information and exit

```

**举例**

* `gm -h` 打印help信息。  
* `gm --install ../demo1` 会生成gm_components文件夹，并安装demo1。  
* `gm [--build]` 通过数据依赖继承关系，生成gm.html。  
* `gm -o test.html` 生成到test.html，此时忽略gm.json中的output值。  



