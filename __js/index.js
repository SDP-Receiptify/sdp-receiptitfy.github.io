const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const form = document.getElementById('inputData')
const downloadButton = document.getElementById('downloadButton')

const query = getQueryParams(window.location.href)
    
const orderParam = query.order
const authCodeParam = query.authCode
const cardHolderParam = query.cardHolder
const thanksParam = query.thanks
const userParam = query.user
const trackCountParam = query.trackCount
const periodParam = query.period

if (userParam) {
    form.setAttribute('disabled', '')
    
    form.innerText = 'Fetching...'

    let query = `?user=${userParam}`

    if (trackCountParam) query += `&trackCount=${trackCountParam}`
    if (periodParam) query += `&period=${periodParam}`
    if (cardHolderParam) query += `&cardHolder=${cardHolderParam}`
    if (authCodeParam) query += `&authCode=${authCodeParam}`
    if (thanksParam) query += `&thanks=${thanksParam}`
    if (orderParam) query += `&order=${orderParam}`

    fetch(`https://api.stefdp.is-a.dev/receiptData/last.fm/${query}`).then(res => res.json()).then(data => {
        if (data.message) {
            console.log(data.message)
            form.innerText = data.message
            
            return;
        }

        showData(data)
    }).catch(e => {
        console.log(e)
        form.innerText = 'Something went wrong'
    })
}

downloadButton.onclick = downloadReceipt

function downloadReceipt() {
    receipt.style.paddingLeft = '30px'
    receipt.style.paddingRight = '30px'
    receipt.style.backgroundImage = 'url("/__assets/receiptBackground.webp")';
    receipt.style.backgroundRepeat = "repeat";

    downloadButton.style.display = 'none'

    html2canvas(receipt).then(function (canvas) {
        const dataURL = canvas.toDataURL("image/png")

        const a = document.createElement("a")

        a.href = dataURL
        a.download = "receipt.png"
        a.style.display = "none"

        document.body.appendChild(a)

        a.click()

        document.body.removeChild(a)
    })

    receipt.style.paddingLeft = '0px'
    receipt.style.paddingRight = '0px'
    receipt.style.background = '#ffffff00'

    downloadButton.style.display = 'block'
}

function validate(type, input) {
    switch(type) {
        case 'username': {
            const usernameRegex = /^[a-zA-Z][a-zA-Z0-9-_]{1,14}$/

            if (!usernameRegex.test(input.value)) {
                input.setCustomValidity("The username should be between 2 and 15 characters, begin with a letter and contain only letters, number, '-' or '_'.")
            } else {
                input.setCustomValidity('')
            }

            break;
        }

        case 'order': {
            const orderRegex = /^([0-9]{4})$/

            if (input.value && !orderRegex.test(input.value)) {
                input.setCustomValidity("The order number must only have 4 numbers")
            } else {
                input.setCustomValidity("")
            }
            
            break;
        }

        case 'authCode': {
            const orderRegex = /^([0-9]{6})$/

            if (input.value && !orderRegex.test(input.value)) {
                input.setCustomValidity("The auth code must only have 4 numbers")
            } else {
                input.setCustomValidity("")
            }

            break;
        }
    }
}

function convertMsToTime(ms) {
    const duration = luxon.Duration.fromObject({
        milliseconds: ms
    })

    const splitDuration = duration.toFormat('yy:MM:dd:hh:mm:ss').split(':')

        while(splitDuration[0] == '00') {
            splitDuration.shift()
        }

        return splitDuration.join(':');
}

function sum(numbers) {
    return numbers.reduce((a, b) => a + b)
}

function showData(data) {
    const receipt = document.getElementById('receipt')
    const inputs = document.getElementById('inputs')

    const receiptTitle = document.getElementById('receiptTitle')
    const tracks = document.getElementById('tracks')
    const totalTracks = document.getElementById('totalTracks')
    const timePeriod = document.getElementById('timePeriod')
    const orderFor = document.getElementById('orderFor')
    const dateGenerated = document.getElementById('dateGenerated')
    const subtotalTime = document.getElementById('subtotalTime')
    const subtotalAmount = document.getElementById('subtotalAmount')
    const totalTime = document.getElementById('totalTime')
    const totalAmount = document.getElementById('totalAmount')
    const cardYear = document.getElementById('cardYear')
    const authCode = document.getElementById('authCode')
    const cardHolder = document.getElementById('cardHolder')
    const thanks = document.getElementById('thanks')

    tracks.innerHTML = data.tracksData.map(track => {
        let artistsHtml = track.artists?.length > 0 ?
            track.artists?.map(artist => {
                return `
                    <a href="${artist.url}" class="song-url">
                        ${artist.name}
                    </a>
                `
            })?.join('& ') :
            `
                <a href="${track.artist.url}" class="song-url">
                    ${track.artist.name}
                </a>
            `

        if (!artistsHtml) artistsHtml = `
            <a href="${track.artist.url}" class="song-url">
                ${track.artist.name}
            </a>
        `

        return `
            <tr>
                <td class="playCount">
                    ${track.playCount}
                </td>
                <td>
                    ${artistsHtml} - <a href="${track.url}" class="song-url">
                        ${track.name}
                    </a>
                </td>
                <td class="align-right tot-time">
                    ${track.duration}
                </td>
                <td class="align-right tot-time">
                    ${track.totalDuration}
                </td>
            </tr>
        `
    }).join('')
    receiptTitle.innerText = `${data.cardHolder}'s RECEIPT`
    totalTracks.innerText = `TOTAL TRACKS: ${data.tracks}`
    data.period.toLowerCase() == 'spotify' ?
        timePeriod.innerHTML = '<img src="/__assets/spotifyLogo.webp" class="spotify-logo">' :
        timePeriod.innerText = data.period
    orderFor.innerText = `ORDER #${data.orderNumber} FOR ${data.username}`
    dateGenerated.innerText = data.dateGenerated
    subtotalTime.innerText = data.subTotal.duration
    subtotalAmount.innerText = data.subTotal.amount
    totalTime.innerText = data.total.duration
    totalAmount.innerText = data.total.amount
    cardYear.innerText = `CARD #: **** **** **** ${data.year}`
    authCode.innerText = `AUTH CODE: ${decodeURIComponent(data.authCode)}`
    cardHolder.innerText = `CARDHOLDER: ${data.cardHolder}`
    thanks.innerText = data.thanks

    inputs.style.display = 'none'
    receipt.style.display = 'block'
}