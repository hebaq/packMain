<template>
  <!-- 引入的表单组件 -->
  <el-form
    ref="form"
    :model="form"
    :rules="rules"
    label-width="80px"
    size="mini"
  >
    <el-form-item label="选择图标" prop="icon">
      <div v-if="iconData" class="icon">
        <div class="mark" @click="cleanIcon">
          <i class="el-icon-delete"></i>
        </div>
        <img :src="iconData" alt="加载失败" srcset="" />
      </div>
      <el-button @click="openFileWithIcon" v-else>选择</el-button>
    </el-form-item>
    <el-form-item label="软件名称" prop="name">
      <el-input v-model:value="form.name"></el-input>
    </el-form-item>
    <el-form-item label="输出路径" prop="output">
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
      <el-button @click="outPath" v-else>选择</el-button>
    </el-form-item>
    <el-form-item label="是否全选" prop="select">
      <el-switch v-model="form.select" @change="switchChange"></el-switch>
    </el-form-item>
    <el-form-item
      :label="form.select ? '选择目录' : '选择文件'"
      prop="fileList"
    >
      <el-button @click="openFile" v-if="form.fileList.length === 0"
        >选择</el-button
      >
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
// import imagePath from "file:///E:/workspace/abyss/packMain/dist/favicon.ico";

let sfName;
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
        select: true,
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
      iconData: "",
    };
  },

  mounted() {
    this.msg = new main.Msg();
    this.msgListen();
  },

  methods: {
    handleFileUpload(event) {
      this.file = event.target.files[0];
      let reader = new FileReader();
      reader.onload = (e) => {
        this.imageUrl = e.target.result;
      };
      reader.readAsDataURL(this.file);
    },
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
        this.$message.error("必须要包含main.exe程序");
        this.loading = false;
        return;
      }

      // 获取打包文件路径
      const path = this.getPath();

      // 软件名称
      sfName = this.form.name.includes(".exe")
      ? this.form.name
      : `${this.form.name}.exe`;
      
      // 打包文件 || 目录
      const params = {
        out: `${this.form.output}\\${sfName}`,
        file: this.form.select ? `${path}\\*` : `${fileNames.join(` `)}`,
        icon: this.form.icon,
      };
      this.msg.emit("pack", params);
    },

    /** 重置 */
    reset() {
      this.$refs["form"].resetFields();
      this.form.fileList = [];
    },

    switchChange() {
      this.form.fileList = [];
    },

    /** 监听应用内消息 */
    msgListen() {
      this.msg.on("iconBase64", (iconData) => {
        this.iconData = `data:image/jpeg;base64,${iconData[0]}`;
      });

      this.msg.on("finish", () => {
        this.$message.success("打包成功");
        this.loading = false;
        // 定位打包后的软件
        this.exportSelect(`${this.form.output}\\${sfName}`);
      });
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
      const path = await selectIcon();
      this.form.icon = path;
      if (path) {
        this.msg.emit("iconPath", path);
      }
    },

    /** 清除图标 */
    cleanIcon() {
      this.form.icon = "";
      this.iconData = "";
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

<style lang="less" scoped>
// 图标
.icon {
  @wh: 50px;
  @br: 2px;

  padding: 5px;
  position: relative;
  width: @wh;
  height: @wh;
  border-radius: @br;
  box-sizing: border-box;

  img {
    width: 100%;
    height: 100%;
  }

  .mark {
    position: absolute;
    width: @wh;
    height: @wh;
    line-height: @wh;
    top: 0;
    left: 0;
    text-align: center;
    color: transparent;
    border-radius: @br;
    transition: all 0.2s;
  }

  &:hover .mark {
    background: rgba(0, 0, 0, 0.3);
    color: #fff;
    cursor: pointer;
  }
}
:deep(.el-card) {
  margin-bottom: 5px;
}

:deep(.el-card__body) {
  padding: 0 10px 0 20px;
}
</style>
