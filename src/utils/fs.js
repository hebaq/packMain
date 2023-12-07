export const fsOpen = {
    file: async () => {
        return await main.fsys.dlg.openEx()
    },
    folder: async () => {
        return await main.fsys.dlg.dir();
    }
}