FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode,
)

FilePond.setOptions({
    // stylePanelAspectRatio: 150/100,
    // imageResizeTargetWidth: 10,
    // imageResizeTargetHeight: 20,
})

FilePond.parse(document.body);
