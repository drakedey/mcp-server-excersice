export default interface Agent {

    executePrompt(prompt: string, handleResponse?: (data: any) => any): Promise<any | void> ;

}