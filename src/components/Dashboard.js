import React, { useEffect, useState } from "react";
import { Card, Row, Select } from "antd";
import { Line, Pie } from "@ant-design/charts";
import moment from "moment";
import TransactionSearch from "./TransactionSearch";
import Header from "./Header";
import AddIncomeModal from "./Modals/AddIncome";
import AddExpenseModal from "./Modals/AddExpense";
import Cards from "./Cards";
import NoTransactions from "./NoTransactions";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { addDoc, collection, getDocs, query } from "firebase/firestore";
import Loader from "./Loader";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { unparse } from "papaparse";

const { Option } = Select;

const Dashboard = () => {
  const [user] = useAuthState(auth);
  const [isExpenseModalVisible, setIsExpenseModalVisible] = useState(false);
  const [isIncomeModalVisible, setIsIncomeModalVisible] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

  const navigate = useNavigate();

  const processChartData = () => {
    const balanceData = [];
    const spendingData = {};
    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = moment(transaction.date);
      const monthMatch = selectedMonth ? transactionDate.month() === selectedMonth : true;
      const yearMatch = selectedYear ? transactionDate.year() === selectedYear : true;
      return monthMatch && yearMatch;
    });

    filteredTransactions.forEach((transaction) => {
      const monthYear = moment(transaction.date).format("MMM YYYY");
      const tag = transaction.tag;

      if (transaction.type === "income") {
        if (balanceData.some((data) => data.month === monthYear)) {
          balanceData.find((data) => data.month === monthYear).balance += transaction.amount;
        } else {
          balanceData.push({ month: monthYear, balance: transaction.amount });
        }
      } else {
        if (balanceData.some((data) => data.month === monthYear)) {
          balanceData.find((data) => data.month === monthYear).balance -= transaction.amount;
        } else {
          balanceData.push({ month: monthYear, balance: -transaction.amount });
        }

        if (spendingData[tag]) {
          spendingData[tag] += transaction.amount;
        } else {
          spendingData[tag] = transaction.amount;
        }
      }
    });

    const spendingDataArray = Object.keys(spendingData).map((key) => ({
      category: key,
      value: spendingData[key],
    }));

    return { balanceData, spendingDataArray };
  };

  const { balanceData, spendingDataArray } = processChartData();

  const showExpenseModal = () => setIsExpenseModalVisible(true);
  const showIncomeModal = () => setIsIncomeModalVisible(true);
  const handleExpenseCancel = () => setIsExpenseModalVisible(false);
  const handleIncomeCancel = () => setIsIncomeModalVisible(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const onFinish = (values, type) => {
    const newTransaction = {
      type: type,
      date: moment(values.date).format("YYYY-MM-DD"),
      amount: parseFloat(values.amount),
      tag: values.tag,
      name: values.name,
    };

    setTransactions([...transactions, newTransaction]);
    setIsExpenseModalVisible(false);
    setIsIncomeModalVisible(false);
    addTransaction(newTransaction);
    calculateBalance();
  };

  const calculateBalance = () => {
    let incomeTotal = 0;
    let expensesTotal = 0;

    transactions.forEach((transaction) => {
      if (transaction.type === "income") {
        incomeTotal += transaction.amount;
      } else {
        expensesTotal += transaction.amount;
      }
    });

    setIncome(incomeTotal);
    setExpenses(expensesTotal);
    setCurrentBalance(incomeTotal - expensesTotal);
  };

  useEffect(() => {
    calculateBalance();
  }, [transactions]);

  async function addTransaction(transaction, many) {
    try {
      const docRef = await addDoc(
        collection(db, `users/${user.uid}/transactions`),
        transaction
      );
      console.log("Document written with ID: ", docRef.id);
      if (!many) {
        toast.success("Transaction Added!");
      }
    } catch (e) {
      console.error("Error adding document: ", e);
      if (!many) {
        toast.error("Couldn't add transaction");
      }
    }
  }

  async function fetchTransactions() {
    setLoading(true);
    if (user) {
      const q = query(collection(db, `users/${user.uid}/transactions`));
      const querySnapshot = await getDocs(q);
      let transactionsArray = [];
      querySnapshot.forEach((doc) => {
        transactionsArray.push(doc.data());
      });
      setTransactions(transactionsArray);
      toast.success("Transactions Fetched!");
    }
    setLoading(false);
  }

  const balanceConfig = {
    data: balanceData,
    xField: "month",
    yField: "balance",
    color: '#4B8895'
  };

  const spendingConfig = {
    data: spendingDataArray,
    angleField: "value",
    colorField: "category",
    color: ['#3A506B', '#5BC0BE', '#081127', '#0B132B', '#4B8895', '#65E0D4']
  };

  function reset() {
    setCurrentBalance(0);
    setIncome(0);
    setExpenses(0);
    console.log("Values reset to 0");
  }

  const cardStyle = {
    boxShadow: "0px 0px 30px 8px rgba(227, 227, 227, 0.75)",
    margin: "2rem",
    borderRadius: "0.5rem",
    minWidth: "400px",
    flex: 1,
  };

  function exportToCsv() {
    const csv = unparse(transactions, {
      fields: ["name", "type", "date", "amount", "tag"],
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Generate month and year options
  const monthOptions = Array.from({ length: 12 }, (_, index) => (
    <Option key={index} value={index}>
      {moment().month(index).format("MMMM")}
    </Option>
  ));

  const yearOptions = Array.from({ length: 10 }, (_, index) => (
    <Option key={moment().year() - index} value={moment().year() - index}>
      {moment().year() - index}
    </Option>
  ));

  return (
    <div className="dashboard-container">
      <Header />
      {loading ? (
        <Loader />
      ) : (
        <>
          <Cards
            currentBalance={currentBalance}
            income={income}
            expenses={expenses}
            showExpenseModal={showExpenseModal}
            showIncomeModal={showIncomeModal}
            cardStyle={cardStyle}
            reset={reset}
          />

          <AddExpenseModal
            isExpenseModalVisible={isExpenseModalVisible}
            handleExpenseCancel={handleExpenseCancel}
            onFinish={onFinish}
          />
          <AddIncomeModal
            isIncomeModalVisible={isIncomeModalVisible}
            handleIncomeCancel={handleIncomeCancel}
            onFinish={onFinish}
          />

          <div style={{ margin: "2rem" }}>
            <Select
              placeholder="Select Month"
              style={{ width: 120, marginRight: "1rem" }}
              onChange={(value) => setSelectedMonth(value)}
            >
              {monthOptions}
            </Select>
            <Select
              placeholder="Select Year"
              style={{ width: 120 }}
              onChange={(value) => setSelectedYear(value)}
            >
              {yearOptions}
            </Select>
          </div>

          {transactions.length === 0 ? (
            <NoTransactions />
          ) : (
            <>
              <Row gutter={16}>
                <Card bordered={true} style={cardStyle}>
                  <h2>Financial Statistics</h2>
                  <Line {...{ ...balanceConfig, data: balanceData }} />
                </Card>

                <Card bordered={true} style={{ ...cardStyle, flex: 0.45 }}>
                  <h2>Total Spending</h2>
                  {spendingDataArray.length === 0 ? (
                    <p>Seems like you haven't spent anything till now...</p>
                  ) : (
                    <Pie {...{ ...spendingConfig, data: spendingDataArray }} />
                  )}
                </Card>
              </Row>
            </>
          )}
          <TransactionSearch
            transactions={transactions}
            exportToCsv={exportToCsv}
            fetchTransactions={fetchTransactions}
            addTransaction={addTransaction}
          />
        </>
      )}
    </div>
  );
};

export default Dashboard;
