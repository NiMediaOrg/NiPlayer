import { AdaptationSet, Initialization, Mpd, MpdDocument, Period, Representation, SegmentBase, SegmentList, SegmentTemplate, SegmentURL } from "./MpdFile";
export declare enum DOMNodeTypes {
    ELEMENT_NODE = 1,
    TEXT_NODE = 3,
    CDATA_SECTION_NODE = 4,
    COMMENT_NODE = 8,
    DOCUMENT_NODE = 9
}
export type ManifestObjectNode = {
    MpdDocument: MpdDocument;
    Mpd: Mpd;
    Period: Period;
    AdaptationSet: AdaptationSet;
    Representation: Representation;
    SegmentTemplate: SegmentTemplate;
    SegmentList: SegmentList;
    SegmentBase: SegmentBase;
    SegmentURL: SegmentURL;
    Initialization: Initialization;
    [props: string]: {
        [props: string]: any;
    };
};
