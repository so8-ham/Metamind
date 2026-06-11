import "dotenv/config.js";

const parseMistralResponse = (res) => {
    if (!res) return null;

    if (res.choices && res.choices.length > 0) {
        const choice = res.choices[0];
        if (choice.message?.content) {
            if (typeof choice.message.content === "string") return choice.message.content;
            if (Array.isArray(choice.message.content)) {
                const textItem = choice.message.content.find((item) => item?.text);
                return textItem ? textItem.text : JSON.stringify(choice.message.content);
            }
        }
        if (choice.content) return choice.content;
        if (choice.text) return choice.text;
    }

    if (res.output && typeof res.output === "string") return res.output;
    if (Array.isArray(res.output) && res.output.length > 0) {
        const outputItem = res.output[0];
        if (typeof outputItem === "string") return outputItem;
        if (outputItem?.text) return outputItem.text;
        if (outputItem?.content && Array.isArray(outputItem.content)) {
            const textItem = outputItem.content.find((item) => item?.text);
            if (textItem) return textItem.text;
        }
        return JSON.stringify(outputItem);
    }

    if (typeof res === "string") return res;
    return JSON.stringify(res);
};

const getMistralAPIResponse = async (input) => {
    try {
        const apiKey = process.env.MISTRAL_API_KEY;
        if (!apiKey) {
            throw new Error("MISTRAL_API_KEY is not configured.");
        }

        const model = process.env.MISTRAL_MODEL || "mistral-small-latest";
        const messages = Array.isArray(input)
            ? input
            : [{ role: "user", content: String(input) }];

        const url = (process.env.MISTRAL_API_URL || "https://api.mistral.ai/v1/chat/completions").trim();
        const body = { model, messages };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify(body),
        });

        const text = await response.text();
        if (!response.ok) {
            console.error("Mistral API error response:", url, response.status, text);
            return "Sorry, I couldn't generate a response.";
        }

        let data;
        try {
            data = JSON.parse(text);
        } catch {
            console.error("Mistral API returned non-JSON response:", url, text);
            return "Sorry, I couldn't generate a response.";
        }

        const parsed = parseMistralResponse(data);
        if (parsed) return parsed;
        console.error("Mistral API returned no usable text:", url, data);
        return "Sorry, I couldn't generate a response.";
    } catch (err) {
        console.error("Mistral integration error:", err);
        return "Sorry, an error occurred.";
    }
};

export default getMistralAPIResponse;
