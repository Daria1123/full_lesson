import { GeoJSON } from 'ol/format'
import { transform as transformCoordinate } from 'ol/proj'

// improts openlayer styles
import Fill from 'ol/style/Fill'
import Style from 'ol/style/Style'
import Stroke from 'ol/style/Stroke'
import Circle from 'ol/style/Circle'
import Text from 'ol/style/Text';

import { Mongolia_boundary } from './MongoliaBorder';

export const DATA_PROJECTION = 'EPSG:4326'
export const FEATURE_PROJECTION = 'EPSG:3857'

export const FIRST_ZOOM_LEVEL = 14.728043293376386

export const MAP_CENTER = [11476599.70604353, 5848085.119670812]

export const MNZOOM = 5.62890062620851
export const MNCENTER = [103.0960492566051, 46.42107283949068]

/** default styles */
export const styles = {
	'MultiPolygon': new Style({
		stroke: new Stroke({
			color: 'rgb(124, 173, 54)',
			width: 2,
		  }),
		fill: new Fill({
			color: 'rgba(0,255,0,0.3)',
		}),
		text: new Text(
			{
				text: "",
				font: '12px Calibri,sans-serif',
				fill: new Fill({ color: '#000' }),
				stroke: new Stroke(
					{
						color: '#24f072',
						width: 2
					}
				)
			}
		),
	}),
	'Polygon': new Style({
		stroke: new Stroke({
			color: 'rgb(124, 173, 54)',
			width: 2,
		  }),
		fill: new Fill({
			color: 'rgba(0,255,0,0.3)',
		}),
		text: new Text(
			{
				text: "",
				font: '12px Calibri,sans-serif',
				fill: new Fill({ color: '#000' }),
				stroke: new Stroke(
					{
						color: '#fff',
						width: 2
					}
				)
			}
		),
	}),
	'LineString': new Style({
		stroke: new Stroke({
			color: 'blue',
			width: 2,
		}),
		text: new Text(
			{
				text: "",
				font: '12px Calibri,sans-serif',
				fill: new Fill({ color: '#000' }),
				stroke: new Stroke(
					{
						color: '#fff',
						width: 2
					}
				)
			}
		),
	}),
	'MultiLineString': new Style({
		stroke: new Stroke({
			color: 'blue',
			width: 2,
		}),
		text: new Text(
			{
				text: "",
				font: '12px Calibri,sans-serif',
				fill: new Fill({ color: '#000' }),
				stroke: new Stroke(
					{
						color: '#fff',
						width: 2
					}
				)
			}
		),
	}),
	"Point": new Style(
		{
			image: new Circle(
				{
					radius: 3,
					fill: new Fill(
						{
							color: 'rgb(255, 0, 0)'
						}
					),
					stroke: new Stroke(
						{
							color: 'black',
							width: 1
						}
					)
				}
			),
			text: new Text(
				{
					text: "",
					font: '12px Calibri,sans-serif',
					fill: new Fill({ color: '#000' }),
					stroke: new Stroke(
						{
							color: '#fff',
							width: 2
						}
					)
				}
			),
		}
	),
	"MultiPoint": new Style(
	{
		image: new Circle(
			{
				radius: 7,
				stroke: new Stroke(
					{
						color: '#fff',
					}
				),
				fill: new Fill(
					{
						color: '#3399CC',
					}
				),
			}
		),
		text: new Text(
			{
				text: "",
				font: '12px Calibri,sans-serif',
				fill: new Fill({ color: '#000' }),
				stroke: new Stroke(
					{
						color: '#fff',
						width: 2
					}
				)
			}
		),
	}),
	"Search": new Style(
		{
			stroke: new Stroke(
				{
					color: 'rgb(124, 173, 54)',
					width: 2,
				}
			),
		}
	),
};

function getBaseLayerList(base_layers) {
    var base_layer_list = []
    for (let base_layer of base_layers) {
        let title = base_layer.get('title')

        base_layer_list.push({
            'title': title,
            'layer': base_layer,
            'is_active': title === 'OpenStreetMap' ? true : false  // open street map заавал байх шаардлагатай!
        })
    }
    return base_layer_list
}

/** Координат хөрвүүлж авах функц */
function transformCoord(coordinate, from_proj=FEATURE_PROJECTION, to_proj=DATA_PROJECTION) {

	const map_coord = transformCoordinate(coordinate, from_proj, to_proj)
	return map_coord
}

/** feature өгч geojson үүсгэх функц */
function readFeature(data) {
    const feature = new GeoJSON({
        dataProjection: DATA_PROJECTION,
        featureProjection:  FEATURE_PROJECTION,
    }).readFeatures(data)
    return feature
}

// feature-ээ өгөөд тухайн feature-ийн төрлийг буцаана
function getTypeFunction(feature) {
    var features_multi = null
    if(feature.getType().includes("Polygon")) {
      features_multi = feature.getPolygons()
    }
    if(feature.getType().includes("Line")) {
      features_multi = feature.getLineStrings()
    }
    if(feature.getType().includes("Point")) {
      features_multi = feature.getPoints()
    }
    return features_multi
  }


// Тухайн feature монголын хил дотор зурагдсан эсэхийг шалгана.
function checkInMongolia(features) {
    const Mongolia_feaure = (new GeoJSON().readFeatures(Mongolia_boundary, {
        dataProjection: DATA_PROJECTION,
        featureProjection: FEATURE_PROJECTION,
    }))[0]

    Mongolia_feaure.setProperties({ id: 'Mongolia' })
    var checkInMGL = true
    var feature_coordinates = []
    const feature_type = features[0].getGeometry().getType()
    features.map((feature, idx) => {
		if (feature_type.includes('Multi')){
			const features_multi = getTypeFunction(feature.getGeometry())
			features_multi.map((feature_multi, idx) => {
			feature_multi.getCoordinates().map((coordiates, ix) => {
				feature_coordinates.push(coordiates)
			})
			})
		} else {
			feature.getGeometry().getCoordinates().map((coords, ix) => {
			feature_coordinates.push(coords)
			})
		}
		})
		if (feature_type.includes('Poly')) {
			feature_coordinates = feature_coordinates[0]
		}
		if (!feature_type.includes("Point")) {
		for(let i=0; i < feature_coordinates.length; i++) {
			const check = Mongolia_feaure.getGeometry().containsXY(feature_coordinates[i][0], feature_coordinates[i][1])
			if (!check) {
			checkInMGL = false
			break
			}
		}
		} else {
		const check = Mongolia_feaure.getGeometry().containsXY(feature_coordinates[0], feature_coordinates[1])
		if (!check) {
			checkInMGL = false
		}
	}
    	return checkInMGL
  }

// Координатаа өгөөд монгол улсын дотор байгаа эсэхийг шалгана
function xyCheckInMongolia(coordinar) {
    const Mongolia_feaure = (new GeoJSON().readFeatures(Mongolia_boundary, {
        dataProjection: DATA_PROJECTION,
        featureProjection: FEATURE_PROJECTION,
    }))[0]
    const check = Mongolia_feaure.getGeometry().containsXY(coordinar[0], coordinar[1])
    return check
}

// Координат өгөөд тухайн хамрах хүрээ дотор байгаа эсэхийг шалгана
function xyCheckInFeatures(coordinar, feature) {
    const cfeature = (new GeoJSON().readFeatures(feature, {
        dataProjection: DATA_PROJECTION,
        featureProjection: FEATURE_PROJECTION,
    }))[0]
    const check = cfeature.getGeometry().containsXY(coordinar[0], coordinar[1])
    return check
}


function writeFeat(features) {
    const format  = new GeoJSON()
    const data = format.writeFeatureObject(features, {
        dataProjection: DATA_PROJECTION,
        featureProjection: FEATURE_PROJECTION,
    })
    const changedFeature = JSON.stringify(data)
    return changedFeature
}

/**
 * Тухайн хамрах хүрээн дотор байгаа эсэхийг шалгах
 * @param {Array} checkFeature шалгах feature
 * @param {object} scopeFeature хамрах хүрээний feature
// */
// function checkFeature(checkFeature, scopeFeature) {

// 	var isScope = true
// 	var feature_coordinates = []

// 	const scope_feature = (new GeoJSON().readFeatures(scopeFeature, {
// 		dataProjection: DATA_PROJECTION,
//         featureProjection: FEATURE_PROJECTION,
//     }))[0]

// 	scope_feature.setProperties({ id: 'Scope' })
// 	const feature_type = features[0].getGeometry().getType()

// 	checkFeature.map((feature, idx) => {
// 		if (feature_type.includes('Multi')){
// 		  const features_multi = getTypeFunction(feature.getGeometry())
// 		  features_multi.map((feature_multi, idx) => {
// 			feature_multi.getCoordinates().map((coordiates, ix) => {
// 			  feature_coordinates.push(coordiates)
// 			})
// 		  })
// 		} else {
// 		  feature.getGeometry().getCoordinates().map((coords, ix) => {
// 			feature_coordinates.push(coords)
// 		  })
// 		}
// 	  })
// 	if (feature_type.includes('Poly')) {
//         feature_coordinates = feature_coordinates[0]
//     }
//     if (!feature_type.includes("Point")) {
//       for(let i=0; i < feature_coordinates.length; i++) {
//         const check = scope_feature.getGeometry().containsXY(feature_coordinates[i][0], feature_coordinates[i][1])
//         if (!check) {
// 			isScope = false
//           break
//         }
//       }
//     } else {
//       const check = scope_feature.getGeometry().containsXY(feature_coordinates[0], feature_coordinates[1])
//       if (!check) {
//         isScope = false
//       }
//     }

// }

export {
    transformCoord,
    readFeature,
    xyCheckInMongolia,
	xyCheckInFeatures,
    checkInMongolia,
    writeFeat,
	getBaseLayerList
}