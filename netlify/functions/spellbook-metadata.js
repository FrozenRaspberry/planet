exports.handler = async (event, context) => {
    query = event.rawQuery
    spellName = event.rawQuery.split('=')[1]
    console.log('spellName', spellName)
    spellInfo = spellName.split('-')
    bookType = parseInt(spellInfo[0])
    spellType = parseInt(spellInfo[1])
    spellLevel = parseInt(spellInfo[2])
    tokenId = parseInt(spellInfo[3])
    bookName = ['Dusty Spell Book', 'Book of Fire', 'Book of Ice', 'Book of Darkness', 'Book of Night', 'Book of Fortune', 'Book of Light']
    bookColorName = ['gray', 'red', 'blue', 'puce', 'purple', 'green', 'yellow']
    spellName1 = ['Fire Ball', 'Flame Wall', 'Fire Storm']
    spellName2 = ['Ice Ball', 'Glacial Spike', 'Blizzard']
    spellName3 = ['Shadow Energy', 'Shadow Flame', 'Soul Harvest']
    spellName4 = 'Lunar Surge'
    spellName5 = 'Charm of Luck'
    spellName6 = 'Impact Star'
    spellName12 = 'Tidal Wave'
    spellName23 = 'Curse of Darkness'
    spellName13 = 'Mana Drain'

    // desc
    if (bookType == 0 && spellLevel == 0) {
        bookDesc = 'An old book with no sign of magic.'
    } else if (bookType != 0 && spellLevel == 0) {
        bookDesc = 'A ' + bookColorName[bookType] + ' book with faint spell power inside.'
    } else if (spellLevel == 1) {
        bookDesc = 'A ' + bookColorName[bookType] + ' book contains the somatic and verbal components for a spell.'
    } else if (spellLevel == 2) {
        bookDesc = 'This powerful ' + bookColorName[bookType] + ' book contains detailed diagrams demonstrating the exact ritual to cast a spell.'
    } else if (spellLevel == 3) {
        bookDesc = 'Nearly unintelligible notations cover this entire book, obscuring the text below. Luckily the activation command is written in bright red.'
    }

    // name
    if (bookType == 0 && spellLevel == 0) {
        name = 'Dusty Spell Book'
    } else if (bookType != 0 && spellLevel == 0) {
        name = bookName[bookType]
    } else if (spellType == 1 && spellLevel > 0) {
        name = spellName1[spellLevel-1]
    } else if (spellType == 2 && spellLevel > 0) {
        name = spellName2[spellLevel-1]
    } else if (spellType == 3 && spellLevel > 0) {
        name = spellName3[spellLevel-1]
    } else if (spellType == 4 && spellLevel > 0) {
        name = spellName4
    } else if (spellType == 5 && spellLevel > 0) {
        name = spellName5
    } else if (spellType == 6 && spellLevel > 0) {
        name = spellName6
    } else if (spellType == 12 && spellLevel > 0) {
        name = spellName12
    } else if (spellType == 23 && spellLevel > 0) {
        name = spellName23
    } else if (spellType == 13 && spellLevel > 0) {
        name = spellName13
    }

    metadata = {
        "description": bookDesc,
        "image": "https://mutant-potion.xyz/img/spell_img/" + bookType + '-' + spellType + '-' + spellLevel + '.png',
        "name": name + ' #' + spellInfo[3],
        "attributes": [
            {
                "trait_type": "Level",
                "value": spellLevel
            }
        ]
    }
    return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(metadata)
    }
}