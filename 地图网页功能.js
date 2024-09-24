// test.js

mapboxgl.accessToken = 'pk.eyJ1Ijoid290dnVtIiwiYSI6ImNsdDAxcW93ODBzcTQya3BoYXUxMHZ2ZXgifQ.2QD6GwmrQiZQNpV5qaSUdg';

var initialCenter = [118.796877, 32.060255]; // 南京的中心点
var initialZoom = 12;
var initialPitch = 45;
var initialBearing = -17.6;

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/wotvum/clxdbp0fv000f01r26duo81t2',
    center: initialCenter,
    zoom: initialZoom,
    pitch: initialPitch,
    bearing: initialBearing
});

let currentTheme = 'theme1';

map.on('load', () => {
    hideAllLayers();
    hideAllButtons();
    selectTheme1();
});

function hideAllLayers() {
    const layers = ['gulou', 'xuanwu', 'qinhuai', 'pukou', 'jiangning', 'jianye'];
    layers.forEach(layer => {
        map.setLayoutProperty(layer, 'visibility', 'none');
        const layer2 = layer + '2';
        map.setLayoutProperty(layer2, 'visibility', 'none');
    });
}

function hideAllButtons() {
    const allButtons = document.querySelectorAll('.buttonsROAD');
    allButtons.forEach(button => button.classList.add('hidden'));
}

function showOptions(layer) {
    hideAllButtons();
    const mainButtons = document.getElementById('main-buttons');
    const layerOptions = document.getElementById(layer + '-options');
    if (mainButtons) {
        mainButtons.classList.add('hidden');
    }
    if (layerOptions) {
        layerOptions.classList.remove('hidden');
    }
    map.setLayoutProperty(layer, 'visibility', 'visible');
    const layer2 = layer + '2';
    if (map.getLayer(layer2)) {
        map.setLayoutProperty(layer2, 'visibility', 'visible');
    }
}

function showSubOptions(layer, type) {
    hideAllButtons();
    const subOptionsId = layer + '-suboptions-' + type;
    const subOptions = document.getElementById(subOptionsId);
    if (subOptions) {
        subOptions.classList.remove('hidden');
    }
    
    // 显示对应的子图层
    const subLayer = layer + '-' + type;
    map.setLayoutProperty(subLayer, 'visibility', 'visible');
    const subLayer2 = subLayer + '2';
    if (map.getLayer(subLayer2)) {
        map.setLayoutProperty(subLayer2, 'visibility', 'visible');
    }
}

function flyToRoute(layer, choice) {
    const coordinates = {
        '上海路': [118.769, 32.0568],
        '颐和路': [118.762, 32.0643],
        '新街口': [118.781, 32.0451],
        '燕雀湖--梧桐大道': [118.824, 32.056],
        '紫峰大厦--鸡鸣寺--玄武湖': [118.791, 32.063],
        '大行宫--南京博物馆': [118.798, 32.0424],
        '1912街区': [118.791, 32.0463],
        '科巷': [118.791, 32.041],
        '张府园--大香炉': [118.778, 32.0329],
        '老门西--水西门': [118.77, 32.0217],
        '夫子庙--熙南里--老门东': [118.778, 32.0225],
        '滨江风光': [118.739, 32.1064],
        '汤山佘村': [118.924, 31.9841],
        '百家湖': [118.816, 31.9339],
        '侵华日军南京大屠杀遇难同胞纪念馆--绿博园': [118.716, 32.0141]
    };

    map.flyTo({
        center: coordinates[choice],
        zoom: 14,
        pitch: 0,
        bearing: 0
    });
}

function resetView() {
    map.flyTo({
        center: initialCenter,
        zoom: initialZoom,
        pitch: initialPitch,
        bearing: initialBearing
    });
    hideAllButtons();
    
    // 仅在选择主题2时显示主按钮
    if (currentTheme === 'theme2') {
        document.getElementById('main-buttons').classList.remove('hidden');
    }
    
    hideAllLayers();
}

let directionsAdded = false; // 标志是否已经添加方向控件

const directions = new MapboxDirections({
    accessToken: mapboxgl.accessToken,
    unit: 'metric',
    profile: 'mapbox/driving',
    language: 'zh',
    alternatives: false,
    geometries: 'geojson',
    zoom: 13,
    controls: { instructions: true },
    placeholderOrigin: '输入起点',
    placeholderDestination: '输入终点',
    bbox: [118, 31, 119.5, 32.5]
});

//document.getElementById('mapbox-directions').appendChild(directions.onAdd(map));
//directionsAdded = true; // 初次添加

document.getElementById('enable-directions').addEventListener('click', function () {
    if (!directionsAdded) {
        document.getElementById('mapbox-directions').appendChild(directions.onAdd(map));
        directionsAdded = true;
    }
    this.disabled = true;
    document.getElementById('disable-directions').disabled = false;
});

document.getElementById('disable-directions').addEventListener('click', function () {
    directions.onRemove(map);
    directionsAdded = false;
    this.disabled = true;
    document.getElementById('enable-directions').disabled = false;
});


map.on('style.load', function() {
    var layers = map.getStyle().layers;
    var colorExpression = null;

    for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'circle' && layers[i].id === 'city-walk') {
            colorExpression = map.getPaintProperty('city-walk', 'circle-color');
            break;
        }
    }

    if (colorExpression) {
        var colors = parseColorExpression(colorExpression);

        for (var type in colors) {
            var colorValue = colors[type];
            var circle = document.querySelector(`.legend button[data-type="${type}"] .color-circle`);
            if (circle) {
                circle.style.backgroundColor = colorValue;
            }
        }
    }
});

function parseColorExpression(expression) {
    if (Array.isArray(expression) && expression.length > 1) {
        var result = {};
        for (var i = 1; i < expression.length; i += 2) {
            result[expression[i]] = expression[i + 1];
        }
        return result;
    }
    return {};
}

document.getElementById('legend').addEventListener('click', function(e) {
    var button = e.target.tagName === 'BUTTON' ? e.target : e.target.closest('button');
    if (button) {
        var type = button.getAttribute('data-type');

        if (type === 'all') {
            map.setFilter('city-walk', null);
            map.setFilter('city-walk_title', null);
        } else {
            map.setFilter('city-walk', ['==', ['get', 'ID'], parseInt(type)]);
            map.setFilter('city-walk_title', ['==', ['get', 'ID'], parseInt(type)]);
        }
    }
});

var resetViewButton = document.createElement('button');
resetViewButton.textContent = '返回初始视角';
resetViewButton.className = 'resetViewButton';
document.body.appendChild(resetViewButton);
resetViewButton.addEventListener('click', resetView);

map.on('click', 'city-walk', function(e) {
    var coordinates = e.features[0].geometry.coordinates.slice();

    var features = map.queryRenderedFeatures(e.point, {
        layers: ['point']
    });

    if (features.length) {
        var feature = features[0];
        var name = feature.properties['地名'] || '未命名';
        var description = feature.properties.description || '没有描述信息';
        var imagePath = feature.properties.image_path;

        var popupContent = '<div class="popup-container">' +
            '<div class="popup-header">' + name + '</div>' +
            '<div class="popup-description">' + description + '</div>';
        if (imagePath) {
            popupContent += '<img class="popup-image" src="' + imagePath + '" alt="POI Image"/>';
        }
        popupContent += '</div>';

        map.flyTo({
            center: coordinates
        });

        new mapboxgl.Popup({
            maxWidth: '400px',
            closeOnClick: false,
            anchor: 'right',
            offset: [-20, 0]
        })
            .setLngLat(coordinates)
            .setHTML(popupContent)
            .addTo(map);
    }
});

map.on('mouseenter', 'city-walk', function() {
    map.getCanvas().style.cursor = 'pointer';
});

map.on('mouseleave', 'city-walk', function() {
    map.getCanvas().style.cursor = '';
});



function selectTheme1() {
    currentTheme = 'theme1';
    hideAllLayers();
    document.getElementById('theme1').classList.add('selected');
    document.getElementById('theme2').classList.remove('selected');
    document.getElementById('theme3').classList.remove('selected');
    document.getElementById('legend').style.display = 'block';
    document.getElementById('directions-container').style.display = 'none';
    hideAllButtons();
    document.getElementById('main-buttons').classList.add('hidden');
}

function selectTheme2() {
    currentTheme = 'theme2';
    hideAllLayers();
    document.getElementById('theme2').classList.add('selected');
    document.getElementById('theme1').classList.remove('selected');
    document.getElementById('theme3').classList.remove('selected');
    document.getElementById('legend').style.display = 'block';
    document.getElementById('directions-container').style.display = 'none';
    hideAllButtons();
    document.getElementById('main-buttons').classList.remove('hidden');
}

function selectTheme3() {
    currentTheme = 'theme3';
    hideAllLayers();
    document.getElementById('theme3').classList.add('selected');
    document.getElementById('theme1').classList.remove('selected');
    document.getElementById('theme2').classList.remove('selected');
    document.getElementById('legend').style.display = 'block';
    document.getElementById('directions-container').style.display = 'block';
    hideAllButtons();
    document.getElementById('main-buttons').classList.add('hidden');

    // 确保方向控件处于正确的状态
    if (directionsAdded) {
        document.getElementById('enable-directions').disabled = true;
        document.getElementById('disable-directions').disabled = false;
    } else {
        document.getElementById('enable-directions').disabled = false;
        document.getElementById('disable-directions').disabled = true;
    }
}


document.getElementById('theme1').addEventListener('click', function() {
    selectTheme1();
});

document.getElementById('theme2').addEventListener('click', function() {
    selectTheme2();
});

document.getElementById('theme3').addEventListener('click', function() {
    selectTheme3();
});


