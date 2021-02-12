import Roact from "@rbxts/roact";
import { LocalizationService } from "@rbxts/services";
import { ZirconDebugInformation, ZirconNetworkMessageType } from "../../Shared/Remotes";
import { ConsoleLuauError, ConsoleMessage, ZrErrorMessage, ZirconContext, ZirconMessageType } from "../../Client/Types";
import ThemeContext, {
	getRichTextColor3,
	getThemeRichTextColor,
	ZirconThemeDefinition,
} from "../../Client/UIKit/ThemeContext";
import { ZrRichTextHighlighter } from "@rbxts/zirconium-ast";

function OutputError(props: { Message: ZrErrorMessage | ConsoleLuauError }) {
	const output = props.Message;

	return (
		<ThemeContext.Consumer
			render={(theme) => {
				const message = new Array<string>();

				if (output.type === ZirconMessageType.ZirconiumError) {
					const { error } = output;
					message.push(
						getRichTextColor3(
							theme,
							"Grey",
							`[${DateTime.fromUnixTimestamp(error.time).FormatLocalTime(
								"LT",
								LocalizationService.SystemLocaleId,
							)}]`,
						),
					);

					if (error.type === ZirconNetworkMessageType.ZirconStandardErrorMessage) {
					} else {
						// message.push(getRichTextColor3(theme, "Cyan", `[Zr]`));
						if (error.script !== undefined) {
							let inner = getRichTextColor3(theme, "Cyan", error.script);
							if (error.source) {
								inner += `:${getRichTextColor3(
									theme,
									"Yellow",
									tostring(error.source[0]),
								)}:${getRichTextColor3(theme, "Yellow", tostring(error.source[1]))}`;
							}
							message.push(getRichTextColor3(theme, "White", inner + " -"));
						}
						message.push(getRichTextColor3(theme, "Red", "error"));
						message.push(getRichTextColor3(theme, "Grey", `ZR${"%.4d".format(error.code)}:`));
						message.push(getRichTextColor3(theme, "White", error.message));
					}
				} else {
					message.push(getRichTextColor3(theme, "Red", "error"));
					message.push(getRichTextColor3(theme, "Grey", `Luau`));
					message.push(getRichTextColor3(theme, "Orange", output.error));
				}

				return (
					<frame Size={new UDim2(1, 0, 0, 25)} BackgroundTransparency={1}>
						<frame
							Size={new UDim2(0, 5, 1, 0)}
							BackgroundColor3={
								props.Message.context === ZirconContext.Server
									? theme.ServerContextColor
									: theme.ClientContextColor
							}
							BorderSizePixel={0}
						/>
						<textlabel
							RichText
							Position={new UDim2(0, 10, 0, 0)}
							Size={new UDim2(1, -15, 0, 25)}
							Text={message.join(" ")}
							BackgroundTransparency={1}
							Font={theme.ConsoleFont}
							TextColor3={theme.PrimaryTextColor3}
							TextXAlignment="Left"
							TextSize={20}
						/>
					</frame>
				);
			}}
		/>
	);
}

function ErrorLine({ TokenInfo, Highlight = true }: { TokenInfo: ZirconDebugInformation; Highlight?: boolean }) {
	return (
		<ThemeContext.Consumer
			render={(theme) => {
				return (
					<frame BackgroundTransparency={1} Size={new UDim2(1, 0, 0, 30)} Position={new UDim2(0.1, 0, 0, 0)}>
						<textlabel
							Text={tostring(TokenInfo.LineAndColumn[0])}
							TextColor3={theme.PrimaryBackgroundColor3}
							BackgroundColor3={theme.PrimaryTextColor3}
							Size={new UDim2(0, 20, 1, 0)}
							Position={new UDim2(0, 20, 0, 0)}
							Font={theme.ConsoleFont}
							TextSize={20}
							TextXAlignment="Center"
						/>
						<textlabel
							RichText
							BackgroundTransparency={1}
							Size={new UDim2(1, 0, 0, 30)}
							Position={new UDim2(0, 20 + 25, 0, 0)}
							Text={Highlight ? new ZrRichTextHighlighter(TokenInfo.Line).parse() : TokenInfo.Line}
							Font={theme.ConsoleFont}
							TextSize={20}
							TextXAlignment="Left"
							TextColor3={theme.PrimaryTextColor3}
						/>
						<textlabel
							BackgroundTransparency={1}
							TextXAlignment="Left"
							RichText
							Font={theme.ConsoleFont}
							TextSize={20}
							TextColor3={theme.PrimaryTextColor3}
							Text={getErrorLine(theme, TokenInfo).ErrorLine}
							Size={new UDim2(1, 0, 0, 30)}
							Position={new UDim2(0, 20 + 25, 0, 0)}
						/>
					</frame>
				);
			}}
		/>
	);
}

function getErrorLine(theme: ZirconThemeDefinition, { Line, TokenLinePosition }: ZirconDebugInformation) {
	const red = getThemeRichTextColor(theme, "Red");
	let resultingString = "";
	let errorArrows = "";
	for (let i = 1; i <= Line.size(); i++) {
		const char = " "; // Line.sub(i, i);
		if (i === TokenLinePosition[0] && i === TokenLinePosition[1]) {
			resultingString += '<font color="' + red + '"><u>' + char + "</u></font>";
			errorArrows += '<font color="' + red + '"><u>^</u></font>';
		} else if (i === TokenLinePosition[0]) {
			resultingString += '<font color="' + red + '"><u>' + char;
			errorArrows += '<font color="' + red + '"><u>^';
		} else if (i > TokenLinePosition[0] && i < TokenLinePosition[1]) {
			resultingString += " ";
			errorArrows += "^";
		} else if (i === TokenLinePosition[1]) {
			resultingString += char + "</u></font>";
			errorArrows += char + "^</u></font>";
		} else {
			resultingString += char;
		}
	}
	return {
		ErrorLine: resultingString,
	};
}

interface ZirconOutputMessageProps {
	Message: ConsoleMessage;
}
export default class ZirconOutputMessage extends Roact.PureComponent<ZirconOutputMessageProps> {
	public render() {
		const { Message } = this.props;

		if (Message.type === ZirconMessageType.ZirconiumError) {
			const { error } = Message;

			if (
				error.type === ZirconNetworkMessageType.ZirconiumParserError ||
				error.type === ZirconNetworkMessageType.ZirconiumRuntimeError
			) {
				if (error.debug) {
					return (
						<Roact.Fragment>
							<OutputError Message={Message} />
							<ErrorLine Highlight TokenInfo={error.debug} />
						</Roact.Fragment>
					);
				}
			}

			return <OutputError Message={Message} />;
		}

		return undefined;
	}
}
