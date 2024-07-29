const getDataForReport = (items,cols) => {
    const dataForReport = items.map((item) => {
        const obj = cols.reduce((acc, colItem, index) => {
            const colKey = colItem['valueId'];
            return { ...acc, [colKey]: item[colKey] }
        }, {})
        return obj;
    })
    return dataForReport
}

module.exports={getDataForReport}