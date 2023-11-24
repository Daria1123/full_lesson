import Map from 'ol/Map';
import View from 'ol/View';
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import Style from 'ol/style/Style'
import Icon from 'ol/style/Icon'
import Text from 'ol/style/Text'
import Stroke from 'ol/style/Stroke'
import Fill from 'ol/style/Fill'
import MVT from 'ol/format/MVT.js';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector'
import { Zoom, FullScreen, ScaleLine } from 'ol/control'
import { getBaseLayerList, readFeature, styles } from './utils';
import VectorTileLayer from 'ol/layer/VectorTile.js';
import VectorTileSource from 'ol/source/VectorTile.js';
import {applyBackground, applyStyle} from 'ol-mapbox-style';
import {createXYZ} from 'ol/tilegrid.js'

import 'ol/ol.css'
import './style.css'

import React, { Fragment, useEffect, useState } from 'react'
import { MAP_CENTER } from './consts';
import { BASE_LAYERS } from './baselayer';
import BaseLayer from './controls/BaseLayer';

export default function () {
	
	const [cMap, setMap] = useState(null)

	function createMap() {
        const base_layer_list = getBaseLayerList(BASE_LAYERS)
        const baseLayer = new BaseLayer({ layers: base_layer_list })

		const alreadyMap = document.querySelectorAll(`#map > .ol-viewport`);
        if (alreadyMap.length > 0)
            return

		const handleMap = new Map({
		  	target: 'map',
			layers: BASE_LAYERS,
			view: new View({
                center: MAP_CENTER,
                zoom: 5
			}),
            controls: [new FullScreen(), new Zoom(), baseLayer, new ScaleLine()],
	  	});
		setMap(handleMap)
	}

    const createVectorTileLayer = (data) => {
        const feature = readFeature(data)
        const style = new Style({
            fill: new Fill({
              color: 'rgba(255, 255, 255, 0.6)',
            }),
            stroke: new Stroke({
              color: '#319FD3',
              width: 1,
            }),
            text: new Text({
              font: '12px Calibri,sans-serif',
              fill: new Fill({
                color: '#000',
              }),
              stroke: new Stroke({
                color: '#fff',
                width: 3,
              }),
            }),
        });

        const vtLayer = new VectorTileLayer({
            declutter: true,
            source: new VectorTileSource({
              maxZoom: 15,
              format: new MVT(),
              url:
                'https://ahocevar.com/geoserver/gwc/service/tms/1.0.0/' +
                'ne:ne_10m_admin_0_countries@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf',
            }),
            style: function (feature) {
              style.getText().setText(feature.get('id'));
              return style;
            },
        });

        cMap.addLayer(vtLayer)

    }
    // Marker зоох function
	const createMarker = async(coordinate) => {
        const point = new Point(coordinate)
        const feature = new Feature({ geometry: point })

        // Marker style
        const marker_style = new Style({
            image: new Icon({
                anchor: [0.5, .86],
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                scale: 0.5,
                src: process.env.PUBLIC_URL + '/images/pmarker.png',
            }),
            text: new Text({
                text: 'Цэг ',
                font: "italic 12px sans-serif",
                offsetX: 20,
                textAlign: "left",
                fill: new Fill({
                  color: "#FFFFFF"
                }),
  
                stroke: new Stroke({
                  color: "#5E8D74",
                  width: 3
                })
              })
            
        })

        feature.setStyle(marker_style)

        const vector_source = new VectorSource({
            features: [feature]
        })
        const vector_layer = new VectorLayer({
            source: vector_source,
            name: 'marker_layer'
        })

        cMap.addLayer(vector_layer)

        // Тухайн аймаг дотор байгаа эсэхийг шалгах
        const res = await fetch(`http://127.0.0.1:8000/geo/point/?in_bbox=${coordinate}`, {
            method: 'GET',
        })

        let return_data = await res.json()
        
    }


    useEffect(
        () => 
        {
			if (cMap) {
				return () => {
                    cMap.setTarget('map');
                };
			}
			else {
				createMap()
			}

        },
        []
    )
    
    // Газрын зураг click хийх
	useEffect(() => {
        if (cMap) {
            cMap.on('click', function(e) {
				createMarker(e.coordinate)
            })
            getAimag()
        }

    }, [cMap])

    // Нэмсэн layer extent хийж нисэж очих
    function fitToExtent (extent, option = { padding: [25, 25, 25, 25], duration: 3000, maxZoom: 19 }) {
		const view = cMap.getView()
		view.fit(extent, option)
	}

    function addVectorLayer(feat, name) {
        const feature = readFeature(feat)

        var vSource = new VectorSource({
            features: feature,
        })

        const geometry_type = feature[0].getGeometry().getType()
        var style = styles[geometry_type]

        const vector_layer = new VectorLayer({
            source: vSource,
            style: style,
            zIndex: 2,
            name: name
        })
        var extent = vector_layer.getSource().getExtent();
        fitToExtent(extent)
        cMap.addLayer(vector_layer)

    }
    
    // Аймаг геом нэмэх 
    async function getAimag() {
        
        // const res = await fetch(`https://erdenet.codely.mn/api/core/user/`, {
        const res = await fetch(`http://127.0.0.1:8000/geo/aimag/`, {
            method: 'GET',
        })

        let return_data = await res.json()

        if (return_data.success) {
            var geom_data = return_data.data
            if(Object.keys(geom_data).length > 0) {
                if (Object.keys(geom_data).length > 0) {
                    if (cMap) {
                        // addVectorLayer(geom_data, 'bairTalbai')
                        createVectorTileLayer(geom_data)
                    }
				}
            }
        }
    }

    return (
		<Fragment>
			<div>
				Газрын зураг
			</div>
			<div id='map' style={{ height: '90vh'}} className='p-1'>
				<div id='box' className='control-box' style={{ zIndex: 1001 }}>
					<div id='draw-box' className='draw-box'></div>
				</div>
			</div>
		</Fragment>
    )
}
