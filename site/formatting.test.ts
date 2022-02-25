import * as cheerio from "cheerio"
import {
    GRAPHER_PREVIEW_CLASS,
    splitContentIntoSectionsAndColumns,
} from "./formatting.js"

const paragraph = `<p>Some paragraph</p>`
const chart = `<figure data-grapher-src="http://ourworldindata.org/grapher/pneumococcal-vaccination-averted-deaths" class="${GRAPHER_PREVIEW_CLASS}"></figure>`
const chart2 = `<figure data-grapher-src="https://ourworldindata.org/grapher/pneumonia-and-lower-respiratory-diseases-deaths" class="${GRAPHER_PREVIEW_CLASS}"></figure>`
const chart3 = `<figure data-grapher-src="https://ourworldindata.org/grapher/pneumonia-mortality-by-age" class="${GRAPHER_PREVIEW_CLASS}"></figure>`
const h2 = `<h2>Some h2 heading</h2>`
const h3 = `<h3>Some h3 heading</h3>`
const h4 = `<h4>Some h4 heading</h4>`

const testColumnsContent = (
    $: CheerioStatic,
    firstColumnHTML: string,
    lastColumnHTML: string,
    style: string = "sticky-right"
) => {
    expect($(`.is-style-${style}`).children().first().html()).toEqual(
        firstColumnHTML
    )
    expect($(`.is-style-${style}`).children().last().html()).toEqual(
        lastColumnHTML
    )
}

describe("creates sections", () => {
    it("from document start", () => {
        const content = paragraph + h2 + paragraph
        const $ = cheerio.load(content)

        splitContentIntoSectionsAndColumns($)
        expect($("section").length).toEqual(2)
    })
    it("from h2", () => {
        const content = h2 + paragraph + h2 + paragraph
        const $ = cheerio.load(content)

        splitContentIntoSectionsAndColumns($)
        expect($("section").length).toEqual(2)
    })
})

it("does not split full-width elements", () => {
    const content = paragraph + h3 + paragraph
    const $ = cheerio.load(content)

    splitContentIntoSectionsAndColumns($)
    expect(cheerio.html($("section").children().eq(1))).toEqual(h3)
})

it("places h4 in its own columns set", () => {
    const content = paragraph + h4 + paragraph
    const $ = cheerio.load(content)

    splitContentIntoSectionsAndColumns($)
    expect($("section").children().eq(1).children().first().html()).toEqual(h4)
    expect($("section").children().eq(1).children().last().html()).toEqual("")
})

describe("splits text and chart", () => {
    it("before full-width element", () => {
        const content = paragraph + chart + h3
        const $ = cheerio.load(content)

        splitContentIntoSectionsAndColumns($)
        testColumnsContent($, paragraph, chart)
    })
    it("before end of section", () => {
        const content = paragraph + chart + h2
        const $ = cheerio.load(content)

        splitContentIntoSectionsAndColumns($)
        testColumnsContent($, paragraph, chart)
    })
    it("before end of document", () => {
        const content = paragraph + chart
        const $ = cheerio.load(content)

        splitContentIntoSectionsAndColumns($)
        testColumnsContent($, paragraph, chart)
    })
})

describe("splits consecutive charts in side-by-side columns", () => {
    it("2 charts after content", () => {
        const content = paragraph + chart + chart2
        const $ = cheerio.load(content)

        splitContentIntoSectionsAndColumns($)
        testColumnsContent($, chart, chart2, "side-by-side")
    })
    it("3 charts", () => {
        const content = chart + chart2 + chart3
        const $ = cheerio.load(content)

        splitContentIntoSectionsAndColumns($)
        testColumnsContent($, chart, chart2, "side-by-side")
        testColumnsContent($, "", chart3, "sticky-right")
    })
})