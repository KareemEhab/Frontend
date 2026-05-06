declare module "react-stars" {
  import type { ComponentType, CSSProperties } from "react";

  export type ReactStarsProps = {
    className?: string;
    edit?: boolean;
    half?: boolean;
    value?: number;
    count?: number;
    char?: string;
    size?: number;
    color1?: string;
    color2?: string;
    onChange?: (value: number) => void;
    style?: CSSProperties;
  };

  const ReactStars: ComponentType<ReactStarsProps>;
  export default ReactStars;
}
