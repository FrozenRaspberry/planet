exports.handler = async (event, context) => {
    query = event.rawQuery
    spellName = event.rawQuery.split('=')[1]
    console.log('spellName', spellName)
    spellInfo = spellName.split('-')
    bookType = parseInt(spellInfo[0])
    spellType = parseInt(spellInfo[1])
    spellLevel = parseInt(spellInfo[2])
    tokenId = parseInt(spellInfo[3])
    svg = '<svg style="width: 110px;height: 110px;" xmlns="http://www.w3.org/2000/svg">'
    if (bookType == 0) {
        svg += '<defs><style>@import url("https://fonts.googleapis.com/css?family=Silkscreen");.number {fill: #403733;font-size: 44px;letter-spacing: -4px}</style></defs>'
        svg += '<image href="../../img/spell_asset/spell-bg.png" height="110" width="110" />'
        svg += '<image href="../../img/spell_asset/book' + bookType + '.png" height="110" width="110" />'
    } else {
        svg += '<image href="../../img/spell_asset/spell-bg-blink.png" height="110" width="110" />' 
        svg += '<image href="../../img/spell_asset/book' + bookType + '.png" height="110" width="110" />'
        if (spellLevel == 0) {
            console.log('query', bookType, spellType, spellLevel, tokenId)
            svg += '<image href="../../img/spell_asset/spell' + bookType + '-' + 1 + '.png" height="110" width="110" opacity="0.1"/>'
        } else {
            svg += '<image href="../../img/spell_asset/spell' + spellType + '-' + spellLevel + '.png" height="110" width="110" opacity="0.1"/>'
        }
    }
    svg += '<image href="../../img/spell_asset/question-mark.png" height="110" width="110" />'
    svg += '</svg>'
    console.log('svg', svg)
    return {
        statusCode: 200,
        headers: {
          "Content-Type": "text",
        },
        body: svg
    }
}