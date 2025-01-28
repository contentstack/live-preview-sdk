/** @jsxImportSource preact */
import { render, screen } from "@testing-library/preact";
import Avatar from "../Avatar";

describe("Avatar Component", () => {
    const personAvatar = {
        id: 1,
        name: "user@email.com",
        image: "https://via.placeholder.com/32x32/ff4988/ff4988?text=1",
    };

    it("renders Single Avatar", () => {
        render(<Avatar avatar={personAvatar} testId="collab-avatar" />);
        expect(screen.getByTestId("collab-avatar")).toBeInTheDocument();
    });

    it("renders Single Avatar with image", () => {
        render(<Avatar avatar={personAvatar} type="image" />);
        expect(screen.getByTestId("collab-avatar-image")).toBeInTheDocument();
    });
});
