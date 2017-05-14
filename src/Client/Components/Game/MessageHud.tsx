import * as React from "react";

import {Game} from "Common/Game";

const styles = require("./MessageHud.scss");

export interface IMessage {
    type: "error" | "info";
    content: string;
}

export interface IMessageHudProps {
    messages: IMessage[];
}

export class MessageHud extends React.Component<IMessageHudProps, undefined> {
    private messageStop: HTMLElement;

    constructor(props: IMessageHudProps) {
        super(props);

        this.bindMessageStop = this.bindMessageStop.bind(this);
    }

    public componentDidMount() {
        this.scrollToBottom();
    }

    public componentDidUpdate() {
        this.scrollToBottom();
    }

    public render() {
        const messages = this.props.messages.map((message, ind) => {
            const className = {
                error: styles.errorMessage,
                info: styles.infoMessage,
            }[message.type];

            const startsWithError = message.content.startsWith("Error: ");

            const content = startsWithError ? message.content.split("Error: ")[1] : message.content;

            return (
                <div className={className} key={ind}>
                    {content}
                </div>
            );
        });

        return (
            <div className={styles.messageHud}>
                {messages}
                <div ref={this.bindMessageStop} />
            </div>
        );
    }

    private bindMessageStop(el: HTMLElement) {
        this.messageStop = el;
    }

    private scrollToBottom() {
        this.messageStop.scrollIntoView();
    }
}
