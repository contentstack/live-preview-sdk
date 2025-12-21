/** @jsxImportSource preact */
import { render, screen } from "@testing-library/preact";
import SkeletonTile from "../SkeletonTile";
describe("SkeletonTile Component", () => {
    it("renders the SVG with the correct number of tiles", () => {
        const props = {
            numberOfTiles: 3,
            tileHeight: 50,
            tileWidth: 100,
            tileBottomSpace: 10,
            tileTopSpace: 10,
            tileleftSpace: 15,
        };

        render(<SkeletonTile {...props} />);

        const rectElements = screen.getAllByTestId("rect");
        expect(rectElements.length).toBe(props.numberOfTiles);
    });
});
