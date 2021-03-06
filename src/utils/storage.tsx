import SQLite, {ResultSet, SQLError} from 'react-native-sqlite-storage';

const errorCB = (err: SQLError) => {
  console.warn('SQL Error: ' + err);
};

const openCB = () => {
  console.log('Database OPENED');
};

const db = SQLite.openDatabase(
  {
    name: 'prepop.db',
    createFromLocation: 1,
    location: 'default',
  },
  openCB,
  errorCB,
);

//query execution function with promise
export const ExecuteQuery = (
  query: string,
  params = [],
): Promise<ResultSet> => {
  query.replace(/^;/, ''); // remove any semicolon

  if (query.search(/select/i) !== -1) {
    query = `${query} limit 150`; //limit of 150 if there is a select
  }

  return new Promise<ResultSet>((resolve, reject) => {
    db.transaction((trans) => {
      trans.executeSql(
        query,
        params,
        (tx, results) => {
          resolve(results);
        },
        (error) => {
          reject(error);
        },
      );
    });
  });
};

//add functions for basic value and string storage
const createAppDataTable = async () => {
  await ExecuteQuery(
    `CREATE TABLE IF NOT EXISTS appData(id String Primary KEY, value string);`,
  );
};

// setAppDataVal
export const setAppData = async (id: string, val: string) => {
  return await ExecuteQuery(
    `INSERT OR REPLACE INTO appData(id, value) VALUES ("${id}", "${val}");`,
  );
};

// this will get the string data
export const getAppData = async (id: string): Promise<string | null> => {
  // destructre it
  interface resObj {
    rows: any;
  }
  const res: ResultSet = await ExecuteQuery(
    `SELECT value from appData where id = "${id}"`,
  );

  //if array is empty it means there is no data
  if (res.rows.length !== 0) {
    return res.rows.item(0).value;
  } else {
    return null;
  }
};

createAppDataTable();
