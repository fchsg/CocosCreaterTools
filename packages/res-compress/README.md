# 插件说明
- 插件提供了对mp3,png,jpg资源的压缩功能,在保证文件质量的前提下,对文件进行瘦身,减小文件体积的大小
- 可以对项目内资源和项目外资源进项压缩。
- 勾选打包后自动压缩资源可以在打包后自动压缩相关资源。
- node js版本需要大于18.18.0

## 插件使用
- 打开快捷键: Cmd/Ctrl + Shift+ m
- 音频文件: 目前插件只会对mp3进行压缩,所以建议项目使用mp3类型音频文件。
- 图片压缩建议使用 imagemin tinypng 算法压缩,个别大图可以通过其他算法尝试压缩。

## 其他说明
- 项目中压缩mp3使用了lame npm地址: https://www.npmjs.com/package/node-lame
- 项目中压缩图片使用了 imagemin. tinypng, smushit 图片压缩算法。


## 快速使用
![使用说明](/doc/1.png "Image 1")











