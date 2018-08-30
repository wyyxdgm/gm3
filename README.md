# GM

GM 开发流程

## Getting Started

主要包括一些开发任务和自动编译

### 开发基础

1.需要node环境，参考[Installing Node.js via package manager](https://nodejs.org/en/download/package-manager/)  

2.quick start

```
git clone [url of this repository]
gm install
gm build

```

### 开发指南

资源结构（举例）

```
├── demo3.html              #主要html源文件，文件名，通过gm.json配置。
├── demo3.json              #主要json源文件，文件名，通过gm.json配置。
├── gm.html                 #由gm生成的html，目标生成文件
├── gm.js                   #入口文件
├── gm.json                 #每个包下都必须有gm.json，配置读取的源文件
└── gm_components
    ├── demo1@V1.0.0
    │   ├── demo1.html
    │   ├── demo1.json
    │   └── gm.json
    └── demo2@V1.0.0
        ├── demo2.html
        ├── demo2.json
        ├── gm.json
        └── gm_components
            ├── demo1.html
            ├── demo1.json
            └── gm.json

```

##架构解释
* 主体框架下，gm.json会配置源文件的文件名称（不带后缀），以及依赖关系。

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


* `gm install` 生成gm_components文件夹，并包含相关依赖包。
* `gm build` 通过数据依赖继承关系，生成gm.html，举例如下：

```
//demo3.html

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

//demo3.json

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

##数据项

* 如果是一般数据，会直接渲染到html。
* 如果是依赖于template,则数据结构可以是：

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



