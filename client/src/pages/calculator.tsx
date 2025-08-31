import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { MobileUtils, useViewport } from "@/lib/mobile";
import { ImpactStyle } from "@capacitor/haptics";
import { OfflineStorage, useOnlineStatus } from "@/lib/offline";

interface CalculatorState {
  currentDisplay: string;
  previousOperation: string;
  operator: string | null;
  waitingForOperand: boolean;
  lastResult: number | null;
}

export default function Calculator() {
  const [state, setState] = useState<CalculatorState>({
    currentDisplay: "0",
    previousOperation: "",
    operator: null,
    waitingForOperand: false,
    lastResult: null,
  });

  const viewport = useViewport();
  const { isOnline } = useOnlineStatus();

  // حفظ العملية الحسابية محلياً
  const saveCalculation = useCallback(async (expression: string, result: string) => {
    try {
      await OfflineStorage.saveCalculation({
        expression,
        result,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('خطأ في حفظ العملية:', error);
    }
  }, []);

  const calculate = useCallback((firstOperand: number, secondOperand: number, operator: string): number => {
    switch (operator) {
      case "+":
        return firstOperand + secondOperand;
      case "-":
        return firstOperand - secondOperand;
      case "×":
      case "*":
        return firstOperand * secondOperand;
      case "÷":
      case "/":
        if (secondOperand === 0) {
          throw new Error("Cannot divide by zero");
        }
        return firstOperand / secondOperand;
      default:
        return secondOperand;
    }
  }, []);

  const formatNumber = useCallback((num: number): string => {
    if (isNaN(num)) return "Error";
    if (!isFinite(num)) return "Error";
    
    const str = num.toString();
    if (str.length > 12) {
      if (num >= 1e12 || num <= -1e12) {
        return num.toExponential(5);
      }
      return parseFloat(num.toPrecision(12)).toString();
    }
    return str;
  }, []);

  const handleNumber = useCallback(async (digit: string) => {
    // إضافة ردة فعل اهتزازية للجوال
    await MobileUtils.triggerHaptic(ImpactStyle.Light);
    
    setState(prev => {
      if (prev.waitingForOperand) {
        return {
          ...prev,
          currentDisplay: digit,
          waitingForOperand: false,
        };
      }
      
      if (prev.currentDisplay === "0" || prev.currentDisplay === "Error") {
        return {
          ...prev,
          currentDisplay: digit,
        };
      }
      
      if (prev.currentDisplay.length >= 12) {
        return prev;
      }
      
      return {
        ...prev,
        currentDisplay: prev.currentDisplay + digit,
      };
    });
  }, []);

  const handleOperator = useCallback(async (nextOperator: string) => {
    // اهتزاز متوسط للعمليات
    await MobileUtils.triggerHaptic(ImpactStyle.Medium);
    setState(prev => {
      const inputValue = parseFloat(prev.currentDisplay);
      
      if (prev.lastResult === null) {
        return {
          ...prev,
          lastResult: inputValue,
          operator: nextOperator,
          waitingForOperand: true,
          previousOperation: `${prev.currentDisplay} ${nextOperator}`,
        };
      }
      
      if (prev.operator && !prev.waitingForOperand) {
        try {
          const currentResult = calculate(prev.lastResult, inputValue, prev.operator);
          const formattedResult = formatNumber(currentResult);
          
          return {
            ...prev,
            currentDisplay: formattedResult,
            lastResult: currentResult,
            operator: nextOperator,
            waitingForOperand: true,
            previousOperation: `${formattedResult} ${nextOperator}`,
          };
        } catch (error) {
          return {
            ...prev,
            currentDisplay: "Error",
            lastResult: null,
            operator: null,
            waitingForOperand: true,
            previousOperation: "",
          };
        }
      }
      
      return {
        ...prev,
        operator: nextOperator,
        waitingForOperand: true,
        previousOperation: `${prev.currentDisplay} ${nextOperator}`,
      };
    });
  }, [calculate, formatNumber]);

  const handleEquals = useCallback(() => {
    setState(prev => {
      if (prev.operator && prev.lastResult !== null && !prev.waitingForOperand) {
        const inputValue = parseFloat(prev.currentDisplay);
        
        try {
          const result = calculate(prev.lastResult, inputValue, prev.operator);
          const formattedResult = formatNumber(result);
          
          return {
            ...prev,
            currentDisplay: formattedResult,
            previousOperation: `${prev.lastResult} ${prev.operator} ${inputValue} =`,
            operator: null,
            waitingForOperand: true,
            lastResult: null,
          };
        } catch (error) {
          return {
            ...prev,
            currentDisplay: "Error",
            previousOperation: "",
            operator: null,
            waitingForOperand: true,
            lastResult: null,
          };
        }
      }
      
      return prev;
    });
  }, [calculate, formatNumber]);

  const handleClear = useCallback(() => {
    setState({
      currentDisplay: "0",
      previousOperation: "",
      operator: null,
      waitingForOperand: false,
      lastResult: null,
    });
  }, []);

  const handleDecimal = useCallback(() => {
    setState(prev => {
      if (prev.waitingForOperand) {
        return {
          ...prev,
          currentDisplay: "0.",
          waitingForOperand: false,
        };
      }
      
      if (prev.currentDisplay.indexOf(".") === -1) {
        return {
          ...prev,
          currentDisplay: prev.currentDisplay + ".",
        };
      }
      
      return prev;
    });
  }, []);

  const handlePercent = useCallback(() => {
    setState(prev => {
      const value = parseFloat(prev.currentDisplay);
      const result = value / 100;
      
      return {
        ...prev,
        currentDisplay: formatNumber(result),
      };
    });
  }, [formatNumber]);

  const handleToggleSign = useCallback(() => {
    setState(prev => {
      if (prev.currentDisplay === "0" || prev.currentDisplay === "Error") {
        return prev;
      }
      
      const value = parseFloat(prev.currentDisplay);
      const result = -value;
      
      return {
        ...prev,
        currentDisplay: formatNumber(result),
      };
    });
  }, [formatNumber]);

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      event.preventDefault();
      
      const key = event.key;
      
      if (key >= "0" && key <= "9") {
        handleNumber(key);
      } else if (key === ".") {
        handleDecimal();
      } else if (key === "+" || key === "-") {
        handleOperator(key);
      } else if (key === "*") {
        handleOperator("×");
      } else if (key === "/") {
        handleOperator("÷");
      } else if (key === "Enter" || key === "=") {
        handleEquals();
      } else if (key === "Escape" || key.toLowerCase() === "c") {
        handleClear();
      } else if (key === "%") {
        handlePercent();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [handleNumber, handleOperator, handleEquals, handleClear, handleDecimal, handlePercent]);

  return (
    <div className="bg-background text-foreground min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto">
        <Card className="bg-card rounded-2xl shadow-2xl overflow-hidden border border-border">
          {/* Calculator Display */}
          <div className="calc-display p-6 pb-4">
            <div className="text-right">
              {/* Previous Operation Display */}
              <div 
                className="text-secondary text-sm h-6 overflow-hidden"
                data-testid="display-previous-operation"
              >
                {state.previousOperation}
              </div>
              {/* Main Display */}
              <div 
                className="text-4xl font-light text-foreground mt-2 h-12 overflow-hidden break-all"
                data-testid="display-current"
              >
                {state.currentDisplay}
              </div>
            </div>
          </div>

          {/* Calculator Buttons */}
          <div className="p-4 pt-2">
            <div className="grid grid-cols-4 gap-3">
              {/* Top Row: Clear, +/-, %, ÷ */}
              <button 
                className="calc-button bg-secondary text-secondary-foreground rounded-xl h-14 text-lg font-medium" 
                onClick={handleClear}
                data-testid="button-clear"
              >
                C
              </button>
              <button 
                className="calc-button bg-secondary text-secondary-foreground rounded-xl h-14 text-lg font-medium"
                onClick={handleToggleSign}
                data-testid="button-toggle-sign"
              >
                +/-
              </button>
              <button 
                className="calc-button bg-secondary text-secondary-foreground rounded-xl h-14 text-lg font-medium"
                onClick={handlePercent}
                data-testid="button-percent"
              >
                %
              </button>
              <button 
                className="calc-button bg-primary text-primary-foreground rounded-xl h-14 text-xl font-light"
                onClick={() => handleOperator("÷")}
                data-testid="button-divide"
              >
                ÷
              </button>

              {/* Second Row: 7, 8, 9, × */}
              <button 
                className="calc-button bg-muted text-muted-foreground rounded-xl h-14 text-xl font-light"
                onClick={() => handleNumber("7")}
                data-testid="button-7"
              >
                7
              </button>
              <button 
                className="calc-button bg-muted text-muted-foreground rounded-xl h-14 text-xl font-light"
                onClick={() => handleNumber("8")}
                data-testid="button-8"
              >
                8
              </button>
              <button 
                className="calc-button bg-muted text-muted-foreground rounded-xl h-14 text-xl font-light"
                onClick={() => handleNumber("9")}
                data-testid="button-9"
              >
                9
              </button>
              <button 
                className="calc-button bg-primary text-primary-foreground rounded-xl h-14 text-xl font-light"
                onClick={() => handleOperator("×")}
                data-testid="button-multiply"
              >
                ×
              </button>

              {/* Third Row: 4, 5, 6, - */}
              <button 
                className="calc-button bg-muted text-muted-foreground rounded-xl h-14 text-xl font-light"
                onClick={() => handleNumber("4")}
                data-testid="button-4"
              >
                4
              </button>
              <button 
                className="calc-button bg-muted text-muted-foreground rounded-xl h-14 text-xl font-light"
                onClick={() => handleNumber("5")}
                data-testid="button-5"
              >
                5
              </button>
              <button 
                className="calc-button bg-muted text-muted-foreground rounded-xl h-14 text-xl font-light"
                onClick={() => handleNumber("6")}
                data-testid="button-6"
              >
                6
              </button>
              <button 
                className="calc-button bg-primary text-primary-foreground rounded-xl h-14 text-xl font-light"
                onClick={() => handleOperator("-")}
                data-testid="button-subtract"
              >
                -
              </button>

              {/* Fourth Row: 1, 2, 3, + */}
              <button 
                className="calc-button bg-muted text-muted-foreground rounded-xl h-14 text-xl font-light"
                onClick={() => handleNumber("1")}
                data-testid="button-1"
              >
                1
              </button>
              <button 
                className="calc-button bg-muted text-muted-foreground rounded-xl h-14 text-xl font-light"
                onClick={() => handleNumber("2")}
                data-testid="button-2"
              >
                2
              </button>
              <button 
                className="calc-button bg-muted text-muted-foreground rounded-xl h-14 text-xl font-light"
                onClick={() => handleNumber("3")}
                data-testid="button-3"
              >
                3
              </button>
              <button 
                className="calc-button bg-primary text-primary-foreground rounded-xl h-14 text-xl font-light"
                onClick={() => handleOperator("+")}
                data-testid="button-add"
              >
                +
              </button>

              {/* Bottom Row: 0 (span 2), ., = */}
              <button 
                className="calc-button bg-muted text-muted-foreground rounded-xl h-14 text-xl font-light col-span-2"
                onClick={() => handleNumber("0")}
                data-testid="button-0"
              >
                0
              </button>
              <button 
                className="calc-button bg-muted text-muted-foreground rounded-xl h-14 text-xl font-light"
                onClick={handleDecimal}
                data-testid="button-decimal"
              >
                .
              </button>
              <button 
                className="calc-button bg-primary text-primary-foreground rounded-xl h-14 text-xl font-light"
                onClick={handleEquals}
                data-testid="button-equals"
              >
                =
              </button>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
