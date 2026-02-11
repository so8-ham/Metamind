import "dotenv/config.js";

const getOpenAIAPIResponce=async (message)=>{
    const options={
        method:"POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model:"gpt-4o-mini",
            messages:[{
                role: "user",
                content: message
            }]
        })
    }

    try{
       const response= await fetch("https://api.openai.com/v1/chat/completions",options);
       const data= await response.json();
       if(data.choices && data.choices.length > 0){
           return data.choices[0].message.content;
       } else {
           console.log("OpenAI API error:", data.error);
           return "Sorry, I couldn't generate a response.";
       }
    } catch(err){
        console.log(err);
        return "Sorry, an error occurred.";
    }
}
export default getOpenAIAPIResponce;