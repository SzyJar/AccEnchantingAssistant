import React from 'react';
import './styles.css';
import Enchanting from './enchanting.js'

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          accessoryValue: 80.0,
          useFsValue: false,
          cronValue: 2.0,
          blackStoneValue: 0.128,
          concStoneValue: 2.25,
          baseFs: 5,
          cost: ['??????.?', '??????.?', '??????.?', '??????.?', '??????.?'],
          fs: ['??? fs', '???? fs', '???? fs', '??? fs', '??? fs'],
          crons: [false, false, false, false, false],
          reblathFs: [15, 22, 32, 50, 85, 97],
          additionalChanceCost : 0,
          info: 'All silver values are in millions',
          status: 'Estimated average cost per level:',
        };
        this.ench = new Enchanting ();
        this.handleAccessoryValueChange = this.handleAccessoryValueChange.bind(this);
        this.handleUseFsValueChange = this.handleUseFsValueChange.bind(this);
        this.handleCronValueChange = this.handleCronValueChange.bind(this);
        this.handleBlackStoneValueChange = this.handleBlackStoneValueChange.bind(this);
        this.handleConcStoneValueChange = this.handleConcStoneValueChange.bind(this);
        this.handleBaseFsChange = this.handleBaseFsChange.bind(this);
        this.handleReblathFsChange = this.handleReblathFsChange.bind(this);
    };

    componentDidMount() {
        this.startCalculations();
    };

    async componentDidUpdate(prevprop, prevState) {
        const { accessoryValue, cronValue, blackStoneValue, concStoneValue, baseFs, reblathFs, useFsValue } = this.state;
        const propertiesToCheck = ['accessoryValue', 'cronValue', 'blackStoneValue', 'concStoneValue', 'baseFs', 'reblathFs', 'useFsValue'];
        
        const hasValueChanged = propertiesToCheck.some(prop => prevState[prop] !== this.state[prop]);
        
        if (hasValueChanged) {
            if (!(
                isNaN(parseFloat(accessoryValue)) ||
                isNaN(parseFloat(cronValue)) ||
                isNaN(parseFloat(blackStoneValue)) ||
                isNaN(parseFloat(concStoneValue)) ||
                isNaN(parseInt(baseFs))
            )) {
                this.startCalculations();
            };
        };
    };
    
    startCalculations() {
        this.ench.fs = [0, 0, 0, 0, 0]; // reset failstacks
        this.ench.cron = [false, false, false, false, false]; // reset cron strategy
        this.ench.baseFs = this.state.baseFs; // set base failstack
        this.ench.reblathFs = this.state.reblathFs // set reblath strategy
        this.ench.additionalChanceCost = this.state.additionalChanceCost // set amount of black stones
        this.ench.armor = this.state.blackStoneValue; // set armor stone value
        this.ench.concentrated = this.state.concStoneValue; // set concentrated stone value
        this.ench.cronPrice = this.state.cronValue; // set cron value
        this.ench.price[0] = this.state.accessoryValue; // set base acc price
        this.ench.calcFsCost(); // calculate fs cost
        this.ench.adjustFailstack(); // find better failstacks
        this.ench.cronStrategy(); // check if cronning is profitable
        this.ench.adjustFailstack(); // find better failstacks after cron strategy is figured out
        this.setState({ crons: this.ench.cron })
        this.setState({ cost: this.ench.calculateCost(this.state.useFsValue).map(item => item.toFixed(1)) }); // calculate enchanting cost
        this.setState({ fs: this.ench.fs.map(item => item + ' fs') });
    };

    handleAccessoryValueChange(event) {
        this.setState({ accessoryValue: parseFloat(event.target.value) });
        if (parseFloat(event.target.value) > 500) {
            // set crons for debo
            this.ench.cronAmount = [95, 288, 865, 2405, 11548];
            this.setState({ info: 'All silver values are in millions, deboreka cron values has been set.' });
        } else {
            // set crons for normal accessory
            this.ench.cronAmount = [62, 187, 562, 1562, 7499];
            this.setState({ info: 'All silver values are in millions.' });
        };
    };

    handleUseFsValueChange() {
        if (this.state.useFsValue) {
            this.setState({ useFsValue: false });
        } else {
            this.setState({ useFsValue: true });
        };
    };

    handleCronValueChange(event) {
        this.setState({ cronValue: parseFloat(event.target.value) });
    };

    handleBlackStoneValueChange(event) {
        this.setState({ blackStoneValue: parseFloat(event.target.value) });
    };

    handleConcStoneValueChange(event) {
        this.setState({ concStoneValue: parseFloat(event.target.value) });
    };

    handleReblathFsChange(event, i, incr) {
        const updatedReblathFs = [...this.state.reblathFs];
        if (i === 0) {
            if (incr === '-' && updatedReblathFs[0] > 5) {
                updatedReblathFs[0] = updatedReblathFs[0] - 5;
                this.setState({ reblathFs: updatedReblathFs });
            } else if (incr === '+' && updatedReblathFs[0] < updatedReblathFs[1] - 4) {
                updatedReblathFs[0] = updatedReblathFs[0] + 5;
                this.setState({ reblathFs: updatedReblathFs });
            };
            let amount = 0;
            if (updatedReblathFs[0] === 10) { amount = 12};
            if (updatedReblathFs[0] === 15) { amount = 21};
            if (updatedReblathFs[0] === 20) { amount = 33};
            if (updatedReblathFs[0] === 25) { amount = 53};
            if (updatedReblathFs[0] === 30) { amount = 84};
            this.setState({ additionalChanceCost: amount });
        } else if (i === 1) {
            if (incr === '-' && updatedReblathFs[1] > updatedReblathFs[0]) {
                updatedReblathFs[1] = updatedReblathFs[1] - 1;
                this.setState({ reblathFs: updatedReblathFs });
            } else if (incr === '+' && updatedReblathFs[1] < updatedReblathFs[2] - 9){
                updatedReblathFs[1] = updatedReblathFs[1] + 1;
                this.setState({ reblathFs: updatedReblathFs });
            };
        } else if (i === 2)  {
            if (incr === '-' && updatedReblathFs[i] > updatedReblathFs[1] + 9 ) {
                updatedReblathFs[i] = updatedReblathFs[i] - 1;
                this.setState({ reblathFs: updatedReblathFs });
            } else if (incr === '+' && updatedReblathFs[i] < updatedReblathFs[3] - 9){
                updatedReblathFs[i] = updatedReblathFs[i] + 1;
                this.setState({ reblathFs: updatedReblathFs });
            };
        } else if (i === 3)  {
            if (incr === '-' && updatedReblathFs[i] > updatedReblathFs[2] + 9 ) {
                updatedReblathFs[i] = updatedReblathFs[i] - 1;
                this.setState({ reblathFs: updatedReblathFs });
            } else if (incr === '+' && updatedReblathFs[i] < updatedReblathFs[4] - 35){
                updatedReblathFs[i] = updatedReblathFs[i] + 1;
                this.setState({ reblathFs: updatedReblathFs });
            };
        } else if (i === 4)  {
            if (incr === '-' && updatedReblathFs[i] > updatedReblathFs[3] + 35 ) {
                updatedReblathFs[i] = updatedReblathFs[i] - 1;
                this.setState({ reblathFs: updatedReblathFs });
            } else if (incr === '+' && updatedReblathFs[i] < 97){
                updatedReblathFs[i] = updatedReblathFs[i] + 1;
                this.setState({ reblathFs: updatedReblathFs });
            };
        } else if (i === 5)  {
            if (incr === '-' && updatedReblathFs[i] > updatedReblathFs[4] ) {
                updatedReblathFs[i] = updatedReblathFs[i] - 1;
                this.setState({ reblathFs: updatedReblathFs });
            } else if (incr === '+' && updatedReblathFs[i] < 97){
                updatedReblathFs[i] = updatedReblathFs[i] + 1;
                this.setState({ reblathFs: updatedReblathFs });
            };
        };
    };

    handleBaseFsChange(event) {
        if (event.target.value <= 5 ){
        this.setState({ baseFs: parseInt(event.target.value) });
        } else {
            this.setState({ baseFs: 5 });
        };
    };

    outputField = (props) => {
        const { text, cost, fs, crons } = props;
        
        return (
            <div className = "outputLevel">
            <h1>{text}</h1>
            <input
                type="text"
                className = "outputBox"
                value = {cost}
                readOnly
                />
                <input
                type="text"
                className = "outputBox"
                value = {fs}
                readOnly
                />
                {crons ? <p style = {{ color: '#9999ff' }}>Use crons</p> : <p>Do not cron</p>}
            </div>
        );
    };

    inputField = (props) => {
        const { text, value, onChangePlus, onChangeMinus} = props;
        
        return (
            <div className = "inputReblath">
                <p>{text}</p>
                <button className = "inputReblathButton" onClick = {onChangeMinus}>{'<'}</button>
                <input
                type = "numeric"
                className = "outputBoxReblath"
                value = {value}
                readOnly />
                <button className = "inputReblathButton" onClick = {onChangePlus}>{'>'}</button>
            </div>
        );
    };

    render() {
        return (
            <div className="App">
                <p id = "info">{this.state.info}</p>
                <div id="input">
                    <p>Base accessory value:</p>
                    <input
                    type = "number"
                    className = "inputBox"
                    value = {this.state.accessoryValue}
                    onChange = {this.handleAccessoryValueChange} />
                    <div id = "crons">
                    <img src={require(".//images/cron.png")} alt="Cron stone" />
                    <input
                    type = "number"
                    className = "inputMatBox"
                    value = {this.state.cronValue}
                    onChange = {this.handleCronValueChange} />
                    </div>
                    <p>Include failstack value:</p>
                    <button
                        className = {`toggle-button ${this.state.useFsValue ? 'active' : 'inactive'}`}
                        onClick = {() => this.handleUseFsValueChange()} >
                        {this.state.useFsValue ? 'YES' : 'NO'}
                    </button>
                    {this.state.useFsValue ? (
                        <div>
                        <p>Material cost:</p>
                        <div id = "materials">
                            <img src={require(".//images/stone.png")} alt="Black stone" />
                            <input
                            type = "number"
                            className = "inputMatBox"
                            value = {this.state.blackStoneValue}
                            onChange = {this.handleBlackStoneValueChange} />

                            <img src={require(".//images/concentrated.png")} alt="Concentrated black stone" />
                            <input
                            type = "number"
                            className = "inputMatBox"
                            value = {this.state.concStoneValue}
                            onChange = {this.handleConcStoneValueChange} />
                        </div>
                        </div>
                    ): null}
                </div>
                <div id = "results">
                    <div className = "outputLevel">
                        <p id = "status">{this.state.status}</p>
                    </div>
                    <this.outputField text = "PRI:"
                     cost = {this.state.cost[0]}
                     fs = {this.state.fs[0]}
                     crons = {this.state.crons[0]} />
                    <this.outputField text = "DUO:"
                     cost = {this.state.cost[1]}
                     fs = {this.state.fs[1]}
                     crons = {this.state.crons[1]} />
                    <this.outputField text = "TRI:"
                     cost = {this.state.cost[2]}
                     fs = {this.state.fs[2]}
                     crons = {this.state.crons[2]} />
                    <this.outputField text = "TET:"
                     cost = {this.state.cost[3]}
                     fs = {this.state.fs[3]}
                     crons = {this.state.crons[3]} />
                    <this.outputField text = "PEN:"
                     cost = {this.state.cost[4]}
                     fs = {this.state.fs[4]}
                     crons = {this.state.crons[4]} />
                </div>
                {this.state.useFsValue ? (
                    <div id = "failstacks">
                        <div>
                            <p>Base failstack:</p>                    
                            <input
                            type = "number"
                            className = "inputBox"
                            value = {this.state.baseFs}
                            onChange = {this.handleBaseFsChange} />
                        </div>              
                            <p>Reblath failstacking strategy:</p>
                            <this.inputField text = "Additional chance:"
                            value = {this.state.reblathFs[0]}
                            onChangePlus = {(event) => this.handleReblathFsChange(event, 0, '+')}
                            onChangeMinus = {(event) => this.handleReblathFsChange(event, 0, '-')} />
                            <this.inputField text = "+14 Reblath up to:"
                            value = {this.state.reblathFs[1]}
                            onChangePlus = {(event) => this.handleReblathFsChange(event, 1, '+')}
                            onChangeMinus = {(event) => this.handleReblathFsChange(event, 1, '-')} />
                            <this.inputField text = "PRI Reblath up to:"
                            value = {this.state.reblathFs[2]}
                            onChangePlus = {(event) => this.handleReblathFsChange(event, 2, '+')}
                            onChangeMinus = {(event) => this.handleReblathFsChange(event, 2, '-')} />
                            <this.inputField text = "DUO Reblath up to:"
                            value = {this.state.reblathFs[3]}
                            onChangePlus = {(event) => this.handleReblathFsChange(event, 3, '+')}
                            onChangeMinus = {(event) => this.handleReblathFsChange(event, 3, '-')} />
                            <this.inputField text = "TRI Reblath up to:"
                            value = {this.state.reblathFs[4]}
                            onChangePlus = {(event) => this.handleReblathFsChange(event, 4, '+')}
                            onChangeMinus = {(event) => this.handleReblathFsChange(event, 4, '-')}/>
                            <this.inputField text = "TET Reblath up to:"
                            value = {this.state.reblathFs[5]}
                            onChangePlus = {(event) => this.handleReblathFsChange(event, 5, '+')}
                            onChangeMinus = {(event) => this.handleReblathFsChange(event, 5, '-')} />
                    </div>
                ) : null}
            </div>
        );
    };
};

export default App;
