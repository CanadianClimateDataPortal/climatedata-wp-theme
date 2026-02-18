export class StepErrorMessage {
	constructor(public message: string, public type: "info" | "error" = "info") {
		this.message = message;
		this.type = type;
	}

	equals(other: StepErrorMessage): boolean {
		return this.message === other.message && this.type === other.type;
	}

}
