import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent } from "@testing-library/preact";
import ReplaceAssetButtonComponent from '../replaceAssetButton';

const targetElement = document.createElement('div');
targetElement.getBoundingClientRect = jest.fn(() => ({
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  top: 70,
  right: 100,
  bottom: 100,
  left: 0,
  toJSON: function() {
    return this;
  }
}));

describe('ReplaceAssetButtonComponent', () => {
  it('renders button with correct text', () => {
    const { getByText } = render(
      <ReplaceAssetButtonComponent
        targetElement={targetElement}
        onClickCallback={() => {}}
      />
    );

    expect(getByText('Replace Asset')).toBeInTheDocument();
  });

  it('applies correct top and right style based on targetElement', () => {
    const { getByTestId } = render(
      <ReplaceAssetButtonComponent
        targetElement={targetElement}
        onClickCallback={() => {}}
      />
    );
    const button = getByTestId('visual-editor-replace-asset');
    expect(button).toHaveStyle('top: 70px');
    expect(button).toHaveStyle('right: 924px');
  });

  it('calls onClickCallback with the correct event when button is clicked', () => {
    const onClickMock = jest.fn();
    const { getByTestId } = render(
      <ReplaceAssetButtonComponent
        targetElement={targetElement}
        onClickCallback={onClickMock}
      />
    );

    fireEvent.click(getByTestId('visual-editor-replace-asset'));
    expect(onClickMock).toHaveBeenCalled();
  });
});
