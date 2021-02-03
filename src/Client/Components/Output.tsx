import Roact from "@rbxts/roact";
import { connect } from "@rbxts/roact-rodux";
import {
	ConsoleLuauError,
	ConsoleMessage,
	ConsolePlainMessage,
	ConsoleStderrMessage,
	ConsoleStdoutMessage,
	ExecutionContext,
} from "../../Client/Types";
import UIKTheme, { getRichTextColor3, getThemeRichTextColor } from "../../Client/UIKit/ThemeContext";
import { ConsoleReducer } from "../../Client/BuiltInConsole/Store/_reducers/ConsoleReducer";
import ScrollView from "./ScrollView";

function OutputPlain(props: { Message: ConsolePlainMessage }) {
	const { message } = props.Message;
	return (
		<UIKTheme.Consumer
			render={(theme) => {
				return (
					<textlabel
						RichText
						Size={new UDim2(1, 0, 0, 25)}
						Text={message}
						BackgroundTransparency={1}
						Font={theme.ConsoleFont}
						TextColor3={theme.PrimaryTextColor3}
						TextXAlignment="Left"
						TextSize={20}
					/>
				);
			}}
		/>
	);
}

function OutputError(props: { Message: ConsoleStderrMessage | ConsoleLuauError }) {
	const output = props.Message;

	return (
		<UIKTheme.Consumer
			render={(theme) => {
				const message = new Array<string>();

				if (output.type === "zr:error") {
					const { error } = output;
					message.push(
						getRichTextColor3(
							theme,
							"Grey",
							`[${DateTime.fromUnixTimestamp(error.time).FormatLocalTime("LT", "en-us")}]`,
						),
					);

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
								props.Message.context === ExecutionContext.Server
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

function OutputMessage(props: { Message: ConsoleStdoutMessage }) {
	const { message } = props.Message;

	return (
		<UIKTheme.Consumer
			render={(theme) => {
				const str = new Array<string>();
				str.push(
					getRichTextColor3(
						theme,
						"Grey",
						`[${DateTime.fromUnixTimestamp(message.time).FormatLocalTime("LT", "en-us")}]`,
					),
				);
				if (message.script !== undefined) {
					const inner = getRichTextColor3(theme, "Cyan", message.script);
					str.push(getRichTextColor3(theme, "White", inner + " -"));
				}
				str.push(message.message);
				return (
					<frame Size={new UDim2(1, 0, 0, 25)} BackgroundTransparency={1}>
						<frame
							Size={new UDim2(0, 5, 1, 0)}
							BackgroundColor3={
								props.Message.context === ExecutionContext.Server
									? theme.ServerContextColor
									: theme.ClientContextColor
							}
							BorderSizePixel={0}
						/>
						<textlabel
							RichText
							Position={new UDim2(0, 10, 0, 0)}
							Size={new UDim2(1, 0, 0, 25)}
							Text={str.join(" ")}
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

interface OutputProps extends MappedProps {}
interface OutputState {
	output: ConsoleMessage[];
}
class OutputComponent extends Roact.Component<OutputProps, OutputState> {
	public constructor(props: OutputProps) {
		super(props);
		this.state = {
			output: props.output,
		};
	}

	public didUpdate(prevProps: OutputProps) {
		if (prevProps.output !== this.props.output) {
			this.setState({ output: this.props.output });
		}
	}

	public render() {
		return (
			<UIKTheme.Consumer
				render={(theme) => {
					return (
						<ScrollView
							AutoScrollToEnd
							Padding={{ PaddingHorizontal: 5, PaddingVertical: 5 }}
							ItemPadding={new UDim(0, 5)}
						>
							{this.state.output.map((r) => {
								if (r.type === "zr:output") {
									return <OutputMessage Message={r} />;
								} else if (r.type === "zr:error" || r.type === "luau:error") {
									return <OutputError Message={r} />;
								} else {
									return <OutputPlain Message={r} />;
								}
							})}
						</ScrollView>
					);
				}}
			/>
		);
	}
}

interface MappedProps {
	readonly output: ConsoleMessage[];
}
const mapStateToProps = (state: ConsoleReducer): MappedProps => {
	return {
		output: state.output,
	};
};

/**
 * A docked console
 */
const ZirconOutput = connect(mapStateToProps)(OutputComponent);
export default ZirconOutput;