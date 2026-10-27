import { RobotClass } from "./RobotClass";

export class RobotDirection {
    names: string[] = ["north", "west", "south", "east"];
    deltas: { dx: number, dy: number }[] = [{ dx: 0, dy: -1 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 1, dy: 0 }];
    angles: number[] = [0, 90, 180, 270];

    public index: number = 2; // south

    constructor(private robot: RobotClass){

    }

    is(name: string){
        return this.names[this.index].toLocaleLowerCase() == name;
    }

    turnRight() {
        this.index = (this.index - 1 + 4) % 4;
        this.robot.steve.rotateY(-Math.PI/2);
    }

    turnLeft() {
        this.index = (this.index + 1 + 4) % 4;
        this.robot.steve.rotateY(Math.PI/2);
    }

    getAngle() {
        return this.angles[this.index];
    }

    getDeltas() {
        return this.deltas[this.index];
    }

    getName(): string {
        return this.names[this.index];
    }
}