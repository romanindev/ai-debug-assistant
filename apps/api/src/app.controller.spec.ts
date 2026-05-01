import { AppController } from './app.controller';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(() => {
    controller = new AppController();
  });

  describe('health', () => {
    it('returns API health status', () => {
      expect(controller.health()).toEqual({
        status: 'ok',
        service: 'ai-debug-assistant-api',
      });
    });
  });
});
