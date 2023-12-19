<template>
  <!-- 引入的表单组件 -->
  <el-form ref="form" :model="form" :rules="rules" label-width="80px">
    <el-form-item label="选择图标" prop="icon">
      <el-button @click="openFileWithIcon">选择</el-button>
      <el-card class="box-card" v-if="form.icon">
        <el-row type="flex" justify="space-between">
          <el-col :span="23">
            {{ form.icon }}
          </el-col>
          <el-col :span="1">
            <i
              class="el-icon-delete"
              style="cursor: pointer"
              @click="form.icon = ''"
            ></i>
          </el-col>
        </el-row>
      </el-card>
    </el-form-item>
    <el-form-item label="软件名称" prop="name">
      <el-input v-model:value="form.name"></el-input>
    </el-form-item>
    <el-form-item label="输出路径" prop="output">
      <el-button @click="outPath">选择</el-button>
      <el-card class="box-card" v-if="form.output">
        <el-row type="flex" justify="space-between">
          <el-col :span="23">
            {{ form.output }}
          </el-col>
          <el-col :span="1">
            <i
              class="el-icon-delete"
              style="cursor: pointer"
              @click="form.output = ''"
            ></i>
          </el-col>
        </el-row>
      </el-card>
    </el-form-item>
    <el-form-item label="是否全选" prop="select">
      <el-switch v-model="form.select"></el-switch>
    </el-form-item>
    <el-form-item
      :label="form.select ? '选择目录' : '选择文件'"
      prop="fileList"
    >
      <el-button @click="openFile">选择</el-button>
      <el-card
        class="box-card"
        v-for="(item, index) in form.fileList"
        :key="index"
      >
        <el-row type="flex" justify="space-between">
          <el-col :span="23">
            {{ item }}
          </el-col>
          <el-col :span="1">
            <i
              class="el-icon-delete"
              style="cursor: pointer"
              @click="removeFile(index)"
            ></i>
          </el-col>
        </el-row>
      </el-card>
    </el-form-item>
    <el-form-item>
      <el-button :loading="loading" type="primary" @click="check"
        >打包</el-button
      >
      <el-button @click="reset">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { fsOpen, selectIcon } from "./utils/fs";
import { Message } from "element-ui";

export default {
  name: "SysShimApp",

  data() {
    return {
      //表单数据
      form: {
        // 图标
        icon: "",
        name: "",
        // 是否全选
        select: false,
        // 输出路径
        output: "",
        // 文件列表
        fileList: [],
      },
      // 校验规则
      rules: {
        name: [{ required: true, message: "请输入软件名称", trigger: "blur" }],
        output: [
          { required: true, message: "请选择输出路径", trigger: "blur" },
        ],
        fileList: [
          {
            required: true,
            message: "请选择要打包的文件",
            type: "array",
            trigger: "blur",
          },
        ],
      },
      // 打包按钮loading
      loading: false,
      msg: null,
    };
  },

  mounted() {
    this.msg = new main.Msg();
  },

  methods: {
    /** 校验 */
    async check() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.pack();
        }
      });
    },
    /** 打包 */
    async pack() {
      this.loading = true;
      const fileNames = this.form.fileList.map((item) => {
        const arr = item.split("\\");
        return arr[arr.length - 1];
      });
      if (!this.form.select && !fileNames.includes("main.exe")) {
        Message.error("必须要包含main.exe程序");
        this.loading = false;
        return;
      }

      // 获取打包文件路径
      const path = this.getPath();

      // 软件名称
      const sfName = this.form.name.includes(".exe")
        ? this.form.name
        : `${this.form.name}.exe`;

      // 打包文件 || 目录
      const params = {
        out: `${this.form.output}\\${sfName}`,
        file: this.form.select ? `${path}\\*` : `${fileNames.join(` `)}`,
        icon: this.form.icon,
      };
      this.msg.emit("pack", params);
      this.msg.on("finish", () => {
        Message.success("打包成功");
        this.loading = false;
        // 定位打包后的软件
        this.exportSelect(`${this.form.output}\\${sfName}`);
      });
    },

    /** 重置 */
    reset() {
      this.$refs["form"].resetFields();
      this.form.fileList = [];
    },

    /** 获取路径 */
    getPath() {
      if (this.form.select) {
        return this.form.fileList[0];
      }
      const arr = this.form.fileList[0].split("\\");
      const path = arr.slice(0, arr.length - 1).join("\\");
      return path;
    },

    /** 选择文件 */
    async openFile() {
      const type = this.form.select ? "folder" : "file";
      const [_, path] = await fsOpen[type]();
      if (path.length) {
        this.form.fileList = Array.isArray(path) ? path : [path];
      }
    },

    /** 打开选择图标文件框 */
    async openFileWithIcon() {
      this.form.icon = await selectIcon();
    },

    async outPath() {
      const [_, path] = await fsOpen["folder"]();
      if (path) {
        this.form.output = path;
      }
    },

    removeFile(index) {
      this.form.fileList.splice(index, 1);
    },
    /** 资源管理器中打开文件 */
    exportSelect(url) {
      main.ws.call(`run`, [
        `
        var arg = ...
        process.exploreSelect(arg);
        `,
        url,
      ]);
    },
  },
};
</script>

<style scoped>
:deep(.el-card) {
  margin: 5px 0;
}

:deep(.el-card__body) {
  padding: 0 20px 0 20px;
}
</style>
