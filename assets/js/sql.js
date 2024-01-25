class Service {
    base_url = `http://172.30.1.9:8200/`;
    service;
    constructor(service) {
      this.service = service;
    }
  
    async get(url) {
      const response = await fetch(this.base_url + this.service + url);
      const data = await response.json();
      if (data) {
        return data;
      } else {
        return null;
      }
    }
  
    async getQuery(url, raw) {
      const response = await fetch(
        this.base_url + this.service + url + `?query_raw=${raw}`
      );
      const data_response = await response.json();
      if (data_response) {
        return data_response;
      } else {
        return null;
      }
    }
  
    async getQueryWithKey(url, key, raw) {
      const response = await fetch(
        this.base_url + this.service + url + `?query_key=${key}&query_raw=${raw}`
      );
      const data_response = await response.json();
      if (data_response) {
        return data_response;
      } else {
        return null;
      }
    }
  
    async postQuery(url, headers, body) {
      const response = await fetch(this.base_url + this.service + url, {
        method: "POST",
        headers: headers,
        body: body,
      });
  
      const data = await response.json();
      if (data) {
        return data;
      } else {
        return null;
      }
    }
  
    handleError(error) {
      console.error(err);
    }
  }
  
  class Paperless {
    base_url = `http://172.30.1.9:8200/`;
    service = "api/";
    url = "paperless/";
    constructor() {
      this.service = "api/paperless/";
    }
  
    async getValue(gate_pass_system, key, value) {
      const response = await fetch(
        this.base_url +
          this.service +
          `?table_name=${gate_pass_system}&query_key=${key}&query_value=${value}`
      );
      const data_response = await response.json();
      if (data_response) {
        return data_response;
      } else {
        return null;
      }
    }
  
    async getLike(key, value) {
      const response = await fetch(
        this.base_url + this.service + `?query_like=${key}&query_value=${value}`
      );
      const data_response = await response.json();
      if (data_response) {
        return data_response;
      } else {
        return null;
      }
    }
  
    async post(body) {
      const response = await fetch(this.base_url + this.service, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          table_name: "gate_pass_system",
          database_name: "slip_db01",
          data: body,
        }),
      });
      const data = await response.json();
      if (data) {
        return data;
      } else {
        return null;
      }
    }
  
    async update(body) {
      body["method"] = "update";
      const response = await fetch(this.base_url + this.service, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
  
      const data = await response.json();
      if (data) {
        return data;
      } else {
        return null;
      }
    }
  
    handleError(error) {
      console.error(err);
    }
  }
  
  class Info extends Service {
    constructor() {
      super("api/");
    }
  
    getLikeName(name) {
      const formData = new FormData();
      formData.append("name", name.toUpperCase() + "%");
      return this.postQuery("name_service/", {}, formData);
    }
  
    getInfoData(number, colum = "user_index") {
      const data = {};
      data[colum] = number;
      return this.postQuery(
        "info/",
        {
          "Content-Type": "application/json",
        },
        JSON.stringify(data)
      );
    }
  
    getDepartmentData(number) {
      return this.postQuery(
        "department/",
        {
          "Content-Type": "application/json",
        },
        JSON.stringify({ department_index: number })
      );
    }
  }
  
  class UserConfig extends Service {
    constructor() {
      super("api/");
    }
  
    getConfig(raw = 'index is not null', table = 'user_config') {
      return this.getQueryWithKey("user_config/",table, raw);
    }
  
    postConfig(data, table = 'user_config') {
      console.log(table)
      return this.postQuery(
        "user_config/",
        {
          "Content-Type": "application/json",
        },
        JSON.stringify({
          table_name: table,
          data: JSON.stringify(data),
        })
      );
    }
  
    updateConfig(data, condition, table = 'user_config') {
      return this.postQuery(
        "user_config/",
        {
          "Content-Type": "application/json",
        },
        JSON.stringify({
          method:'update',
          table_name: table,
          condition: condition,
          data: JSON.stringify(data),
        })
      );
    }
  }
  
  class Approve extends Service {
    constructor() {
      super("api/");
    }
  
    async create(obj) {
      let responseApprove = await this.postQuery(
        "approve/",
        {
          "Content-Type": "application/json",
        },
        JSON.stringify({
          user_index: obj.user_index,
          type_index: obj.type_index,
          department_index: obj.type_index ? obj.type_index : 0,
          slip_index: obj.slip_index ? obj.slip_index : 0,
        })
      );
      let responseApproveFlow = null;
      console.log(responseApprove["data"][0][0]);
      if (responseApprove["data"]) {
        responseApproveFlow = await this.postQuery(
          "approve_flow/",
          {
            "Content-Type": "application/json",
          },
          JSON.stringify({
            approve_process_id: responseApprove["data"][0][0],
            approve_json: JSON.stringify(obj.approve_json),
          })
        );
      }
  
      return [responseApprove, responseApproveFlow];
    }
  
    updateProcessFlow(raw) {
      return this.getQuery("user_config/", raw);
    }
  
    getConfig(raw) {
      return this.getQuery("user_config/", raw);
    }
  
    getState(raw) {
      return this.get(
        "approve_flow/?query_key=approve_process_id&query_value=" + raw
      );
    }
  
    getApproveJson(approve_process_id) {
      return this.getQuery("user_config/", approve_process_id);
    }
  }
  
  export const $api = {
    data_info: new Info(),
    user_config: new UserConfig(),
    paperless: new Paperless(),
    approve: new Approve(),
  };
  