import AuroraPointsModel from "../Model";
export default abstract class AbstractView {
    constructor(container: string, onLoad: () => void);
    abstract renderPoints(model: AuroraPointsModel): void;
}
