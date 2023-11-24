import { Tile as TileLayer } from 'ol/layer';
import TileImage from 'ol/source/TileImage'

import WMTS from 'ol/source/WMTS';
import WMTSTileGrid from 'ol/tilegrid/WMTS';

import { getTopLeft, getWidth } from 'ol/extent';
import { get as getProjection } from 'ol/proj';

const nsdiBaseUrl = "https://geo.nsdi.gov.mn/geoserver/gwc/service/wmts/"

const googlemap = new TileLayer({
    preload: 6,
    source: new TileImage({
        url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
        crossOrigin: 'anonymous',
    }),
    title: 'Google'
})

const arcTopoMap = new TileLayer({
    preload: 6,
    source: new TileImage({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        crossOrigin: 'anonymous'
    }),
    title: 'Arc'
})

const openStreetMap = new TileLayer({
    preload: 6,
    source: new TileImage({
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        crossOrigin: 'anonymous',
    }),
    title: 'OpenStreetMap',
})


const DATA_PROJECTION = 'EPSG:4326'
const dprojection = getProjection(DATA_PROJECTION);
const projectionExtent = dprojection.getExtent();
const size = getWidth(projectionExtent) / 512;
let resolutions = new Array(15);
let matrixIds = new Array(15);

for (let z = 0; z < 15; ++z) {
    // generate resolutions and matrixIds arrays for this WMTS
    resolutions[z] = size / Math.pow(2, z);
    matrixIds[z] = DATA_PROJECTION + ':' + z;
}

const nsdiTileSource = new WMTS({
    url: nsdiBaseUrl,
    layer: "MasterMap",
    matrixSet: DATA_PROJECTION,
    format: 'image/png',
    projection: dprojection,
    tileGrid: new WMTSTileGrid({
        origin: getTopLeft(projectionExtent),
        resolutions: resolutions,
        matrixIds: matrixIds,
        tileSize: 256,
    }),
    style: "",
    wrapX: false,
})

// Анивчаад байсан
const masterMap = new TileLayer(
    {
        source: nsdiTileSource,
        visible: true,
        title: "NSDI"
    }
)

export const BASE_LAYERS = [googlemap, arcTopoMap, masterMap, openStreetMap]
