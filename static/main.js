//default
const canvas = new fabric.Canvas('canvas', {
    width: 500,
    height: 500,
    backgroundColor: '#fff',
    preserveObjectStacking: true
})

const maxWidth = 650
const maxHeight = 650
const minWidth = 400
const minHeight = 400

let file = $('#file')[0]
let images = []
let dropDownMenu;

$().ready(function () {
    $.ajax({
        url: 'https://api.memegen.link/templates/',
        method: 'GET',
        dataType: 'json'
    }).done(function (data) {
        for (let item of data) {
            images.push(item)
        }

        dropDownMenu = $('#templates .option')[0]
        for (let _template of images) {
            let a = document.createElement('a')
            let img = document.createElement('img')
            let name = document.createElement('p')

            a.classList.add('dropdown-item')

            img.src = _template['blank']
            img.alt = "Not found"
            img.style.width = "200px"

            name.innerText = _template['name']

            a.append(img, name)
            dropDownMenu.appendChild(a)
        }

        let templates = $('#templates a')
        for (let i = 0; i < templates.length; i++) {
            let template = templates[i].getElementsByTagName('img')[0]
            template.addEventListener('click', function () {
                fabric.Image.fromURL(template.src, function (img) {
                    addBackgroundToCanvas(canvas, img)
                }, {crossOrigin: 'anonymous'})
            })
        }
    })
})

file.addEventListener('change', function(){
    let img = file.files[0]
    if(!img){
        return
    }
    if (img['type'].split('/')[0] !== 'image') {
        alert("You have to upload an image!")
        file.value = null
        return
    }
    let reader = new FileReader()

    reader.onload = function(e){
        let data = reader.result
        fabric.Image.fromURL(data, function(img){
            addBackgroundToCanvas(canvas, img)
        }, {crossOrigin: 'anonymous'})
    }

    reader.readAsDataURL(img)
})

let addTextBtn = $('#addText')[0]
let text = $('#text')[0]
let color = $('#color')[0]
let searchField = $('#searchField')[0]

searchField.addEventListener('input', function() {
    let query = searchField.value
    const regex = new RegExp("(\\s|^)" + query, 'i')
    for (let dropdownItem of $('#templates .dropdown-item')) {
        let pTag = dropdownItem.getElementsByTagName('p')[0]
        if (regex.test(pTag.innerText)) {
            dropdownItem.style.display = "block"
            highlightRegex(pTag, query)
        } else {
            dropdownItem.style.display = "none"
        }

    }
})

addTextBtn.addEventListener('click', function(){
    let _text = new fabric.IText(text.value, {
        left: 100,
        top: 100,
        fontSize: 20,
        fill: color.value,
        align: 'mid',
        originX: 'center',
        originY: 'center',
    })
    canvas.add(_text)
})

window.addEventListener('keydown', function(e){
    if (isInputActive()) {
        return
    }
    if(e.key === "Delete" || e.key === "Backspace"){
        canvas.remove(canvas.getActiveObject())
    }
})

function highlightRegex(pTag, query) {
    let text = pTag.innerText
    pTag.innerHTML = ''
    let matched = getIndicesOf(query, text, false)

    let lastNormalIndex = 0
    for (let index of matched) {
        if (index > lastNormalIndex) {
            let normalSpan = document.createElement('span')
            normalSpan.classList.add('regex-normal')

            normalSpan.innerText = text.substring(lastNormalIndex, index)
            pTag.appendChild(normalSpan)
        }

        let regexSpan = document.createElement('span')
        regexSpan.classList.add('regex-highlight')

        regexSpan.innerText = text.substr(index, query.length)
        pTag.appendChild(regexSpan)
        lastNormalIndex = index + query.length
    }

    if (text.substring(lastNormalIndex)) {
        let normalSpan = document.createElement('span')
        normalSpan.classList.add('regex-normal')

        normalSpan.innerText = text.substring(lastNormalIndex)
        pTag.appendChild(normalSpan)
    }
}

function getIndicesOf(searchStr, str, caseSensitive) {
    let searchStrLen = searchStr.length;
    if (searchStrLen === 0) {
        return [];
    }
    let startIndex = 0, index, indices = [];
    if (!caseSensitive) {
        str = str.toLowerCase();
        searchStr = searchStr.toLowerCase();
    }
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchStrLen;
    }
    return indices;
}

function selectObj(canvas, obj, ignoreContains = false) {
    if (ignoreContains || canvas.contains(obj)) {
        canvas.setActiveObject(obj)
    }
}

function isInputActive() {
    for (let inp of $('input, textarea')) {
        if (document.activeElement === inp) {
            return true
        }
    }
    return false
}

function addBackgroundToCanvas(canvas, img) {
    canvas.clear()
    img.set({"selectable":false, "evented": false})

    if (img.width > maxWidth || img.height > maxHeight) {
        if (img.width > img.height) {
            img.scaleToWidth(maxWidth, false)
        } else {
            img.scaleToHeight(maxHeight, false)
        }
    } else if (img.width < minWidth || img.height < minHeight) {
        if (img.width > img.height) {
            img.scaleToHeight(minHeight, false)
        } else {
            img.scaleToWidth(minWidth, false)
        }
    }

    canvas.setWidth(img.getScaledWidth())
    canvas.setHeight(img.getScaledHeight())
    canvas.add(img)
}

canvas.on('object:moving', function (e) {
    let obj = e.target;
    // if object is too big ignore
    if (obj.currentHeight > obj.canvas.height || obj.currentWidth > obj.canvas.width) {
        return;
    }
    obj.setCoords();
    // top-left  corner
    if (obj.getBoundingRect().top < 0 || obj.getBoundingRect().left < 0) {
        obj.top = Math.max(obj.top, obj.top - obj.getBoundingRect().top);
        obj.left = Math.max(obj.left, obj.left - obj.getBoundingRect().left);
    }
    // bot-right corner
    if (obj.getBoundingRect().top + obj.getBoundingRect().height > obj.canvas.height || obj.getBoundingRect().left + obj.getBoundingRect().width > obj.canvas.width) {
        obj.top = Math.min(obj.top, obj.canvas.height - obj.getBoundingRect().height + obj.top - obj.getBoundingRect().top);
        obj.left = Math.min(obj.left, obj.canvas.width - obj.getBoundingRect().width + obj.left - obj.getBoundingRect().left);
    }
});

canvas.on('mouse:dblclick', function(e) {
    if (canvas.getActiveObjects().length) {
        return
    }
    let position = getMouseCoords(canvas, e)
    let text = new fabric.IText('Write something funny', {
        fontSize: 50,
        fill: '#ffffff',
        align: 'mid',
        originX: 'center',
        originY: 'center'
    })

    if (text.width > canvas.width) {
        text.scaleToWidth(canvas.width, false)
    }

    // set text in canvas boundary (x)
    if (position.x - text.width / 2 < 0) {
        text.left = text.width / 2
    } else if (position.x + text.width / 2 > canvas.width) {
        text.left = canvas.width - text.width / 2
    } else {
        text.left = position.x
    }

    // set text in canvas boundary(y)
    if (position.y - text.height / 2 < 0) {
        text.top = text.height / 2
    } else if (position.y + text.height / 2 > canvas.height) {
        text.top = canvas.height - text.height / 2
    } else {
        text.top = position.y
    }


    if (position.y - text.height / 2 < 0) {
        text.top = text.height / 2
    }

    canvas.add(text)
    text.enterEditing()
    text.selectAll()
    selectObj(canvas, text, true)
})

function getMouseCoords(canvas, e) {
  let pointer = canvas.getPointer(e, true);
  return {
      x: pointer.x,
      y: pointer.y
  }
}

let saveBtn = document.getElementById('download')
saveBtn.addEventListener('click', function(){
    let data = canvas.toDataURL()
    let link = document.createElement('a')
    link.href = data
    link.download = 'image.png'
    link.click()
})

// select template updated
const selected = document.querySelector(".selected");
const optionsContainer = document.querySelector(".options-container");

const optionsList = document.querySelectorAll(".option");

selected.addEventListener("click", () => {
  optionsContainer.classList.toggle("active");
});

optionsList.forEach(o => {
  o.addEventListener("click", () => {
    selected.innerHTML = o.querySelector("label").innerHTML;
    optionsContainer.classList.remove("active");
  });
});