function FooComponent(props: { children: any }) { 
  return <div>{props.children}</div>;
}

interface BarProps {
  name: string;
  children?: any;
}

function BarComponent(props: BarProps): any { 
  return <FooComponent>
    <h1 title={props.name}>
      {props.children}
    </h1>
  </FooComponent>
}

class ContainerComponent {
  props: {children: any };

  constructor(props: { children: any }) {
    this.props = props;
  }
  render() {
    return (
      <div>{this.props.children}</div>
    );
  }
}

export {};
