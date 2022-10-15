/**
 * @Author likan
 * @Date 2022-10-15 21:36:16
 * @Filepath editorconfig-vscode/src/Message.ts
 * @Description
 */

enum MessagesEnum {
	EMPTY_WORKSPACE = 'EMPTY_WORKSPACE',
	CONFIG_ALREADY_EXIST = 'CONFIG_ALREADY_EXIST',
	CAN_NOT_READ_TEMPLATE_FILE = 'CAN_NOT_READ_TEMPLATE_FILE',
}

const zhCnMessage: Record<MessagesEnum, string> = {
	EMPTY_WORKSPACE: '工作区没有包含任何文件。',
	CONFIG_ALREADY_EXIST: '这个工作区已经存在一个 .editorconfig 文件。',
	CAN_NOT_READ_TEMPLATE_FILE: '无法读取 EditorConfig 模板文件, 在',
}

const enMessages: Record<MessagesEnum, string> = {
	EMPTY_WORKSPACE: "Workspace doesn't contain any folders.",
	CONFIG_ALREADY_EXIST:
		'An .editorconfig file already exists in this workspace.',
	CAN_NOT_READ_TEMPLATE_FILE: 'Could not read EditorConfig template file at',
}

const MessageMap: Record<string, Record<MessagesEnum, string>> = {
	en: enMessages,
	'zh-cn': zhCnMessage,
}

const config = JSON.parse(<string>process.env.VSCODE_NLS_CONFIG)
const messages = MessageMap[config.locale] ?? enMessages

export default messages
