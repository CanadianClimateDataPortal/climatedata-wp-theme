/**
 * Represents a "Download Step" error message.
 *
 * A "Download Step" error message is a message to be displayed to the user
 * describing why the step is invalid.
 *
 * If the message should be displayed more as information rather than an
 * error, the `type` attribute can be set to "info".
 */
export class StepErrorMessage {
	constructor(public message: string, public type: "info" | "error" = "error") {
		this.message = message;
		this.type = type;
	}

	equals(other: StepErrorMessage): boolean {
		return this.message === other.message && this.type === other.type;
	}
}
