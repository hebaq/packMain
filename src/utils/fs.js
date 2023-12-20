export const fsOpen = {
    file: async () => {
        return await main.fsys.dlg.openEx()
    },
    folder: async () => {
        return await main.fsys.dlg.dir();
    }
}
export const selectIcon = async () => {
    const [_, file] = await main.fsys.dlg.open('*.png|*.ico|*.jpg')
    let base64Data;

    return file || '';
}