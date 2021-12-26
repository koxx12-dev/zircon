import { ZrEnumItem } from "@rbxts/zirconium/out/Data/Enum";
import { ZrObjectUserdata } from "@rbxts/zirconium/out/Data/Userdata";
import { ZirconEnum, EnumMatchTree } from "./ZirconEnum";

/**
 * An extension of the `ZrEnumItem` class for Zircon.
 */
export class ZirconEnumItem<
	TParent extends ZirconEnum<string> = ZirconEnum<string>,
	K extends string = string
> extends ZrEnumItem {
	public constructor(private enumParent: TParent, id: number, name: K) {
		super(enumParent, id, name);
	}

	/**
	 * Performs a match against this enum value - similar to `match` in Rust.
	 * @param matches The matches to check against
	 */
	public match<R>(matches: EnumMatchTree<TParent, K, R>) {
		return matches[this.getName() as K](this);
	}
}
