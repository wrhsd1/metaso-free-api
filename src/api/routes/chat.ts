import _ from 'lodash';
import fs from 'fs';
import path from 'path';

import Request from '@/lib/request/Request.ts';
import Response from '@/lib/response/Response.ts';
import chat from '@/api/controllers/chat.ts';
import logger from '@/lib/logger.ts';

let token: string | undefined;

const updateToken = () => {
    fs.readFile(path.join('/mnt', 'cookie.txt'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        token = data.trim();
    });
}

export default {

    prefix: '/v1/chat',

    post: {

        '/completions': async (request: Request) => {
            updateToken(); 
            request
                .validate('body.model', v => _.isUndefined(v) || _.isString(v))
                .validate('body.messages', _.isArray)
                .validate('body.tempature', v => _.isUndefined(v) || _.isNumber(v))
                .validate('headers.authorization', _.isString)
            const { model, messages, stream, tempature } = request.body;;
            if (stream) {
                const stream = await chat.createCompletionStream(model, messages, token, tempature);
                return new Response(stream, {
                    type: "text/event-stream"
                });
            }
            else
                return await chat.createCompletion(model, messages, token, tempature);
        }

    }

}
