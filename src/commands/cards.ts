// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace CardsCommands {
	export function Node(): string {
		return `/cards`
	}

	export function Type(): string {
		return `${Node()}/$type`
	}

	export function Version(): string {
		return `${Node()}/$ver`
	}

	export function WLiveNode(): string {
		return `${Node()}/wlive`
	}

	export function WLiveSDLink(): string {
		return `${WLiveNode()}/$sdlink`
	}

	export function WLiveActLink(): string {
		return `${WLiveNode()}/$actlink`
	}

	export function WLiveBatteryState(): string {
		return `${WLiveNode()}/$battstate`
	}

	export function WLiveAutoIn(): string {
		return `${WLiveNode()}/autoin`
	}

	export function ShowMeters(): string {
		return `${WLiveNode()}/meters`
	}

	export function WLiveCardNode(card: number): string {
		return `${WLiveNode()}/${card}`
	}

	export function WLiveCardControlNode(card: number): string {
		return `${WLiveCardNode(card)}/$ctl`
	}

	export function WLiveCardControl(card: number): string {
		return `${WLiveCardControlNode(card)}/control`
	}

	export function WLiveCardOpenSession(card: number): string {
		return `${WLiveCardControlNode(card)}/opensession`
	}

	export function WLiveCardEditMarker(card: number): string {
		return `${WLiveCardControlNode(card)}/editmarker`
	}

	export function WLiveCardGotoMarker(card: number): string {
		return `${WLiveCardControlNode(card)}/gotomarker`
	}

	export function WLiveCardDeleteMarker(card: number): string {
		return `${WLiveCardControlNode(card)}/deletemarker`
	}

	export function WLiveCardDeleteSession(card: number): string {
		return `${WLiveCardControlNode(card)}/deletesession`
	}

	export function WLiveCardTime(card: number): string {
		return `${WLiveCardControlNode(card)}/stime`
	}

	export function WLiveCardNameSession(card: number): string {
		return `${WLiveCardControlNode(card)}/namesession`
	}

	export function WLiveCardSetMarker(card: number): string {
		return `${WLiveCardControlNode(card)}/setmarker`
	}

	export function WLiveCardFormatSDCard(card: number): string {
		return `${WLiveCardControlNode(card)}/formatsdcard`
	}

	export function WLiveCardConfigNode(card: number): string {
		return `${WLiveCardNode(card)}/cfg`
	}

	export function WLiveCardRecTracks(card: number): string {
		return `${WLiveCardConfigNode(card)}/rectracks`
	}

	export function WLiveCardPlayMode(card: number): string {
		return `${WLiveCardConfigNode(card)}/playmode`
	}

	export function WLiveCardStatusNode(card: number): string {
		return `${WLiveCardNode(card)}/$stat`
	}

	export function WLiveCardState(card: number): string {
		return `${WLiveCardStatusNode(card)}/state`
	}

	export function WLiveCardETime(card: number): string {
		return `${WLiveCardStatusNode(card)}/etime`
	}

	export function WLiveCardSDFree(card: number): string {
		return `${WLiveCardStatusNode(card)}/sdfree`
	}

	export function WLiveCardSDSize(card: number): string {
		return `${WLiveCardStatusNode(card)}/sdsize`
	}

	export function WLiveCardSDState(card: number): string {
		return `${WLiveCardStatusNode(card)}/sdstate`
	}

	export function WLiveCardSessionList(card: number): string {
		return `${WLiveCardStatusNode(card)}/sessionlist`
	}

	export function WLiveCardMarkerList(card: number): string {
		return `${WLiveCardStatusNode(card)}/markerlist`
	}

	export function WLiveCardSessionNameList(card: number): string {
		return `${WLiveCardStatusNode(card)}/snamelist`
	}

	export function WLiveCardSessions(card: number): string {
		return `${WLiveCardStatusNode(card)}/sessions`
	}

	export function WLiveCardMarkers(card: number): string {
		return `${WLiveCardStatusNode(card)}/markers`
	}

	export function WLiveCardSessionLength(card: number): string {
		return `${WLiveCardStatusNode(card)}/sessionlen`
	}

	export function WLiveCardSessionPosition(card: number): string {
		return `${WLiveCardStatusNode(card)}/sessionpos`
	}

	export function WLiveCardMarkerPosition(card: number): string {
		return `${WLiveCardStatusNode(card)}/markerpos`
	}

	export function WLiveCardTracks(card: number): string {
		return `${WLiveCardStatusNode(card)}/tracks`
	}

	export function WLiveCardRate(card: number): string {
		return `${WLiveCardStatusNode(card)}/rate`
	}

	export function WLiveCardLinkID(card: number): string {
		return `${WLiveCardStatusNode(card)}/linkid`
	}

	export function WLiveCardStart(card: number): string {
		return `${WLiveCardStatusNode(card)}/start`
	}

	export function WLiveCardStop(card: number): string {
		return `${WLiveCardStatusNode(card)}/stop`
	}

	export function WLiveCardErrorMessage(card: number): string {
		return `${WLiveCardStatusNode(card)}/errormessage`
	}

	export function WLiveCardErrorCode(card: number): string {
		return `${WLiveCardStatusNode(card)}/errorcode`
	}
}
