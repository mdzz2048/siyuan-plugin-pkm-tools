export interface IOption {
    key: string,
    text: string,
}

export type IOptions = IOption[];

export interface ILimits { 
    min: number,
    max: number,
    step: number
};