/**
 * Local ONNX inference configuration.
 *
 * Put the two model files on an HTTPS domain allowed by
 * wx.downloadFile, or upload them to cloud storage and fill cloudFileId.
 * The quantized files are in yolo-program/exports/int8.
 */
module.exports = {
  USE_ONNX: true,
  ALLOW_MOCK_FALLBACK: false,
  MODEL_VERSION: 'beef-local-onnx-wx-1.1',
  MODEL_SIZE_LABEL: '约 15.3 MB',
  DETECTOR_FILE: 'part_detector_wx_fp32.onnx',
  FRESHNESS_FILE: 'freshness_classifier_wx_fp32.onnx',
  MODEL_URL_CLOUD_FUNCTION: 'getModelUrl',
  MODEL_BASE_URL: '',
  MODEL_CLOUD_IDS: {
    detector: 'cloud://xinjinxianyv-d0glj1dtxac1b7bf7.7869-xinjinxianyv-d0glj1dtxac1b7bf7-1528934951/models/beef-v1/part_detector_int8.onnx',
    freshness: 'cloud://xinjinxianyv-d0glj1dtxac1b7bf7.7869-xinjinxianyv-d0glj1dtxac1b7bf7-1528934951/models/beef-v1/freshness_classifier_int8.onnx'
  },
  EXPECTED_MODEL_BYTES: {
    detector: 9856091,
    freshness: 6161012
  },
  LOCAL_MODEL_PATHS: {
    detector: '',
    freshness: ''
  },
  DET_CONF: 0.30,
  DET_NMS_IOU: 0.45,
  DET_MAX_BOXES: 50,
  MIN_PART_CONF: 0.90,
  MAX_BBOX_AREA: 0.98,
  DET_IMGSZ: 640,
  CLS_IMGSZ: 224
}
